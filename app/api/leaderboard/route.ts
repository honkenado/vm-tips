import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    .select("user_id, updated_at")
    .eq("tournament_id", tournament.id);

  if (predictionsError) {
    return NextResponse.json(
      { error: predictionsError.message },
      { status: 500 }
    );
  }

  const predictionMap = new Map(
    (predictions ?? []).map((prediction) => [
      prediction.user_id,
      prediction.updated_at,
    ])
  );

  const leaderboard = (profiles ?? []).map((profile) => {
    const updatedAt = predictionMap.get(profile.id);

    return {
      id: profile.id,
      username: profile.username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      has_prediction: Boolean(updatedAt),
      updated_at: updatedAt ?? null,
    };
  });

  leaderboard.sort((a, b) => {
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

  return NextResponse.json({ leaderboard });
}