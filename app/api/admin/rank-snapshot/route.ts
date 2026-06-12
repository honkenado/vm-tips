import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { scorePrediction } from "@/lib/scoring";
import type { GroupData } from "@/types/tournament";

const TOURNAMENT_SLUG = "world-cup-2026";

type KnockoutSelections = Record<string, string>;

function asGroups(value: unknown): GroupData[] {
  return Array.isArray(value) ? (value as GroupData[]) : [];
}

function asKnockout(value: unknown): KnockoutSelections {
  return value && typeof value === "object" ? (value as KnockoutSelections) : {};
}

function displayName(entry: {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
}) {
  return (
    [entry.first_name, entry.last_name].filter(Boolean).join(" ").trim() ||
    entry.username ||
    entry.email ||
    "Deltagare"
  );
}

function getTotalGroupGoals(groups: GroupData[]): number {
  let total = 0;

  for (const group of groups) {
    if (!Array.isArray(group.matches)) continue;

    for (const match of group.matches) {
      const homeGoals =
        match.homeGoals !== "" && match.homeGoals != null ? Number(match.homeGoals) : null;
      const awayGoals =
        match.awayGoals !== "" && match.awayGoals != null ? Number(match.awayGoals) : null;

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

export async function POST(request: NextRequest) {
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

  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const { data: adminProfile } = await serviceSupabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = adminProfile?.role === "admin" || adminProfile?.is_admin === true;

  if (!isAdmin) {
    return NextResponse.json({ error: "Endast admin" }, { status: 403 });
  }

  const { data: tournament, error: tournamentError } = await serviceSupabase
    .from("tournaments")
    .select("id")
    .eq("slug", TOURNAMENT_SLUG)
    .single();

  if (tournamentError || !tournament) {
    return NextResponse.json({ error: "Kunde inte hitta turneringen" }, { status: 404 });
  }

  const [
    { data: profiles, error: profilesError },
    { data: predictions, error: predictionsError },
    { data: resultsRow, error: resultsError },
  ] = await Promise.all([
    serviceSupabase
      .from("profiles")
      .select("id, username, first_name, last_name, email, role, payment_status")
      .eq("payment_status", "paid"),
    serviceSupabase
      .from("predictions")
      .select("user_id, group_stage, knockout, golden_boot, golden_boot_corrected")
      .eq("tournament_id", tournament.id),
    serviceSupabase
      .from("tournament_results")
      .select("group_stage, knockout, golden_boot")
      .eq("tournament_id", tournament.id)
      .maybeSingle(),
  ]);

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  if (predictionsError) {
    return NextResponse.json({ error: predictionsError.message }, { status: 500 });
  }

  if (resultsError) {
    return NextResponse.json({ error: resultsError.message }, { status: 500 });
  }

  const officialGroupStage = asGroups(resultsRow?.group_stage);
  const officialKnockout = asKnockout(resultsRow?.knockout);
  const officialGoldenBoot =
    typeof resultsRow?.golden_boot === "string" ? resultsRow.golden_boot : "";

  const officialGroupGoals = getTotalGroupGoals(officialGroupStage);

  const predictionMap = new Map(
    (predictions ?? []).map((prediction: any) => [prediction.user_id, prediction])
  );

  const snapshotDate = new Date().toISOString().slice(0, 10);

const leaderboard = (profiles ?? [])
  .map((profile: any) => {
    const prediction = predictionMap.get(profile.id) as any | undefined;
    const hasPrediction = Boolean(prediction);

    const predictedGroupStage = asGroups(prediction?.group_stage);
    const predictedKnockout = asKnockout(prediction?.knockout);
    const predictedGoldenBoot =
      prediction?.golden_boot_corrected?.trim() ||
      prediction?.golden_boot?.trim() ||
      "";

    const breakdown = hasPrediction
      ? scorePrediction(
          predictedGroupStage,
          predictedKnockout,
          officialGroupStage,
          officialKnockout,
          predictedGoldenBoot,
          officialGoldenBoot
        )
      : null;

    const predictedGroupGoals = hasPrediction
      ? getTotalGroupGoals(predictedGroupStage)
      : 0;

    const groupGoalsDiff = hasPrediction
      ? Math.abs(predictedGroupGoals - officialGroupGoals)
      : Number.MAX_SAFE_INTEGER;

    return {
      id: profile.id,
      points: breakdown?.total ?? 0,
      groupGoalsDiff,
      hasPrediction,
      displayName: displayName(profile),
    };
  })
  .sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    if (a.groupGoalsDiff !== b.groupGoalsDiff) {
      return a.groupGoalsDiff - b.groupGoalsDiff;
    }

    if (a.hasPrediction && !b.hasPrediction) return -1;
    if (!a.hasPrediction && b.hasPrediction) return 1;

    return a.displayName.localeCompare(b.displayName, "sv");
  })
  .map((entry, index) => ({
    user_id: entry.id,
    snapshot_date: snapshotDate,
    rank: index + 1,
    points: entry.points,
  }));

  const { error: upsertError } = await serviceSupabase
    .from("user_rank_snapshots")
    .upsert(leaderboard, {
      onConflict: "user_id,snapshot_date",
    });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    saved: leaderboard.length,
    snapshotDate,
  });
}