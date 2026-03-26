import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scorePrediction } from "@/lib/scoring";

type DbPredictionRow = {
  user_id: string;
  group_stage: unknown;
  knockout: unknown;
  updated_at: string | null;
};

type DbProfileRow = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  role: string | null;
};

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
    .select("id, username, first_name, last_name, created_at, role")
    .order("created_at", { ascending: true });

  if (profilesError) {
    return NextResponse.json(
      { error: profilesError.message },
      { status: 500 }
    );
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from("predictions")
    .select("user_id, group_stage, knockout, updated_at")
    .eq("tournament_id", tournament.id);

  if (predictionsError) {
    return NextResponse.json(
      { error: predictionsError.message },
      { status: 500 }
    );
  }

  const { data: resultsRow, error: resultsError } = await supabase
    .from("tournament_results")
    .select("group_stage, knockout")
    .eq("tournament_id", tournament.id)
    .maybeSingle();

  if (resultsError) {
    return NextResponse.json(
      { error: resultsError.message },
      { status: 500 }
    );
  }

  const officialGroupStage = (resultsRow?.group_stage ?? []) as any;
  const officialKnockout = (resultsRow?.knockout ?? {}) as any;

  const predictionMap = new Map(
    ((predictions ?? []) as DbPredictionRow[]).map((prediction) => [
      prediction.user_id,
      prediction,
    ])
  );

  const leaderboard = ((profiles ?? []) as DbProfileRow[]).map((profile) => {
    const prediction = predictionMap.get(profile.id);

    const hasPrediction = Boolean(prediction);

    const breakdown = hasPrediction
      ? scorePrediction(
          (prediction?.group_stage ?? []) as any,
          (prediction?.knockout ?? {}) as any,
          officialGroupStage,
          officialKnockout
        )
      : null;

    return {
      id: profile.id,
      username: profile.username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      has_prediction: hasPrediction,
      updated_at: prediction?.updated_at ?? null,
      points: breakdown?.total ?? 0,
      breakdown,
    };
  });

  leaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    if (a.has_prediction && !b.has_prediction) return -1;
    if (!a.has_prediction && b.has_prediction) return 1;

    if (a.updated_at && b.updated_at) {
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    const aName = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim();
    const bName = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim();

    return aName.localeCompare(bName, "sv");
  });

  const leaderboardWithPlacement = leaderboard.map((entry, index) => ({
    ...entry,
    placement: index + 1,
  }));

  return NextResponse.json({ leaderboard: leaderboardWithPlacement });
}