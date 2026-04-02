import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type StoredMatch = {
  homeTeam?: string;
  awayTeam?: string;
  [key: string]: unknown;
};

type StoredGroup = {
  teams?: string[];
  matches?: StoredMatch[];
  [key: string]: unknown;
};

function migrateLegacyTeamName(team: string) {
  if (team === "FIFA playoff 1") return "DR Kongo";
  if (team === "FIFA playoff 2") return "Irak";
  return team;
}

function migrateLegacyGroupStage(groupStage: unknown) {
  if (!Array.isArray(groupStage)) return [];

  return groupStage.map((group) => {
    const safeGroup = (group ?? {}) as StoredGroup;

    const teams = Array.isArray(safeGroup.teams)
      ? safeGroup.teams.map((team) =>
          typeof team === "string" ? migrateLegacyTeamName(team) : team
        )
      : [];

    const matches = Array.isArray(safeGroup.matches)
      ? safeGroup.matches.map((match) => {
          const safeMatch = (match ?? {}) as StoredMatch;

          return {
            ...safeMatch,
            homeTeam:
              typeof safeMatch.homeTeam === "string"
                ? migrateLegacyTeamName(safeMatch.homeTeam)
                : safeMatch.homeTeam,
            awayTeam:
              typeof safeMatch.awayTeam === "string"
                ? migrateLegacyTeamName(safeMatch.awayTeam)
                : safeMatch.awayTeam,
          };
        })
      : [];

    return {
      ...safeGroup,
      teams,
      matches,
    };
  });
}

export async function GET(request: NextRequest) {
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

  const { data: tournament, error: tournamentError } = await serviceSupabase
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

  const { data: prediction, error } = await serviceSupabase
    .from("predictions")
    .select("group_stage, knockout, golden_boot, updated_at")
    .eq("user_id", user.id)
    .eq("tournament_id", tournament.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!prediction) {
    return NextResponse.json({ prediction: null });
  }

  return NextResponse.json({
    prediction: {
      ...prediction,
      group_stage: migrateLegacyGroupStage(prediction.group_stage),
    },
  });
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

  const body = await request.json();

  const groups = migrateLegacyGroupStage(body.groups);
  const knockout = body.knockout ?? {};
  const goldenBoot =
    typeof body.goldenBoot === "string" ? body.goldenBoot.trim() : "";

  const { data: tournament, error: tournamentError } = await serviceSupabase
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

  const { data: existingPrediction } = await serviceSupabase
    .from("predictions")
    .select("golden_boot_corrected")
    .eq("user_id", user.id)
    .eq("tournament_id", tournament.id)
    .maybeSingle();

  const payload = {
    user_id: user.id,
    tournament_id: tournament.id,
    group_stage: groups,
    knockout,
    golden_boot: goldenBoot,
    golden_boot_corrected: existingPrediction?.golden_boot_corrected ?? null,
  };

  const { error } = await serviceSupabase.from("predictions").upsert(payload, {
    onConflict: "user_id,tournament_id",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}