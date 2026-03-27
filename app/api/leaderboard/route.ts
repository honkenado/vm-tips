import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { scorePrediction } from "@/lib/scoring";

type DbPredictionRow = {
  user_id: string;
  group_stage: any;
  knockout: any;
  golden_boot: string | null;
  golden_boot_corrected: string | null; // ⭐ LÄGG TILL
  updated_at: string | null;
};

type DbProfileRow = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  role: string | null;
  payment_status: "paid" | "unpaid" | null;
};

function getTotalGroupGoals(groups: any[]): number {
  if (!Array.isArray(groups)) return 0;

  let total = 0;

  for (const group of groups) {
    if (!group?.matches || !Array.isArray(group.matches)) continue;

    for (const match of group.matches) {
      const homeGoals =
        match?.homeGoals !== "" && match?.homeGoals != null
          ? Number(match.homeGoals)
          : null;

      const awayGoals =
        match?.awayGoals !== "" && match?.awayGoals != null
          ? Number(match.awayGoals)
          : null;

      if (
        homeGoals !== null &&
        awayGoals !== null &&
        !Number.isNaN(homeGoals) &&
        !Number.isNaN(awayGoals)
      ) {
        total += homeGoals + awayGoals;
      }
    }
  }

  return total;
}

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const authSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  const currentUserId = user?.id ?? null;

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id")
    .eq("slug", "world-cup-2026")
    .single();

  if (tournamentError || !tournament) {
    return NextResponse.json(
      { error: "Tournament not found" },
      { status: 404 }
    );
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name, created_at, role, payment_status")
    .order("created_at", { ascending: true });

  if (profilesError) {
    return NextResponse.json(
      { error: profilesError.message },
      { status: 500 }
    );
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from("predictions")
    .select("user_id, group_stage, knockout, golden_boot, golden_boot_corrected, updated_at")
    .eq("tournament_id", tournament.id);

  if (predictionsError) {
    return NextResponse.json(
      { error: predictionsError.message },
      { status: 500 }
    );
  }

  const { data: resultsRow, error: resultsError } = await supabase
    .from("tournament_results")
    .select("group_stage, knockout, golden_boot")
    .eq("tournament_id", tournament.id)
    .maybeSingle();

  if (resultsError) {
    return NextResponse.json(
      { error: resultsError.message },
      { status: 500 }
    );
  }

  const officialGroupStage = (resultsRow?.group_stage as any[]) ?? [];
  const officialKnockout =
    (resultsRow?.knockout as Record<string, string>) ?? {};
  const officialGoldenBoot = resultsRow?.golden_boot ?? "";

  const officialGroupGoals = getTotalGroupGoals(officialGroupStage);

  const predictionMap = new Map<string, DbPredictionRow>(
    ((predictions ?? []) as DbPredictionRow[]).map((prediction) => [
      prediction.user_id,
      prediction,
    ])
  );

  const leaderboard = ((profiles ?? []) as DbProfileRow[])
    .map((profile) => {
      const prediction = predictionMap.get(profile.id);
      const hasPrediction = Boolean(prediction);
      const isPaid = profile.payment_status === "paid";

      const predictedGroupStage = (prediction?.group_stage ?? []) as any[];
      const predictedKnockout = (prediction?.knockout ?? {}) as Record<
        string,
        string
      >;
      const predictedGoldenBoot =
  prediction?.golden_boot_corrected?.trim() ||
  prediction?.golden_boot?.trim() ||
  "";

      const rawBreakdown =
        hasPrediction && isPaid
          ? scorePrediction(
              predictedGroupStage,
              predictedKnockout,
              officialGroupStage,
              officialKnockout,
              predictedGoldenBoot,
              officialGoldenBoot
            )
          : null;

      const predictedGroupGoals =
        hasPrediction && isPaid ? getTotalGroupGoals(predictedGroupStage) : 0;

      const groupGoalsDiff =
        hasPrediction && isPaid
          ? Math.abs(predictedGroupGoals - officialGroupGoals)
          : Number.MAX_SAFE_INTEGER;

      return {
        id: profile.id,
        username: profile.username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        payment_status: profile.payment_status,
        has_prediction: isPaid ? hasPrediction : false,
        updated_at: isPaid ? prediction?.updated_at ?? null : null,
        points: isPaid ? rawBreakdown?.total ?? 0 : 0,
        predicted_group_goals: predictedGroupGoals,
        official_group_goals: officialGroupGoals,
        group_goals_diff: groupGoalsDiff,
        breakdown: isPaid ? rawBreakdown : null,
      };
    })
    .filter((entry) => entry.payment_status === "paid");

  leaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.group_goals_diff !== b.group_goals_diff) {
      return a.group_goals_diff - b.group_goals_diff;
    }
    if (a.has_prediction && !b.has_prediction) return -1;
    if (!a.has_prediction && b.has_prediction) return 1;

    const aName = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim();
    const bName = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim();

    return aName.localeCompare(bName, "sv");
  });

  const leaderboardWithPlacement = leaderboard.map((entry, index) => ({
    ...entry,
    placement: index + 1,
  }));

  const currentUserIsVisible =
    currentUserId &&
    leaderboardWithPlacement.some((entry) => entry.id === currentUserId);

  return NextResponse.json({
    leaderboard: leaderboardWithPlacement,
    currentUserId: currentUserIsVisible ? currentUserId : null,
  });
}