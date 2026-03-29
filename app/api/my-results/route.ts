import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { scorePrediction } from "@/lib/scoring";
import type { GroupData } from "@/types/tournament";

type KnockoutSelections = Record<string, string>;

const TOURNAMENT_SLUG = "world-cup-2026";

function asGroups(value: unknown): GroupData[] {
  return Array.isArray(value) ? (value as GroupData[]) : [];
}

function asKnockout(value: unknown): KnockoutSelections {
  return value && typeof value === "object"
    ? (value as KnockoutSelections)
    : {};
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
    .eq("slug", TOURNAMENT_SLUG)
    .single();

  if (tournamentError || !tournament) {
    return NextResponse.json(
      { error: "Kunde inte hitta turneringen" },
      { status: 404 }
    );
  }

  const tournamentId = tournament.id as string;

  const [{ data: profile }, { data: prediction, error: predictionError }, { data: results, error: resultsError }] =
    await Promise.all([
      serviceSupabase
        .from("profiles")
        .select("id, first_name, last_name, username, payment_code, payment_status")
        .eq("id", user.id)
        .maybeSingle(),
      serviceSupabase
        .from("predictions")
        .select(
          "group_stage, knockout, golden_boot, golden_boot_corrected, updated_at"
        )
        .eq("user_id", user.id)
        .eq("tournament_id", tournamentId)
        .maybeSingle(),
      serviceSupabase
        .from("tournament_results")
        .select("group_stage, knockout, golden_boot")
        .eq("tournament_id", tournamentId)
        .maybeSingle(),
    ]);

  if (predictionError) {
    return NextResponse.json(
      { error: predictionError.message },
      { status: 500 }
    );
  }

  if (resultsError) {
    return NextResponse.json(
      { error: resultsError.message },
      { status: 500 }
    );
  }

  if (!prediction) {
    return NextResponse.json({
      profile: profile ?? null,
      hasPrediction: false,
      hasOfficialResults: Boolean(results),
      breakdown: null,
      prediction: null,
      officialResultsReady: Boolean(results),
    });
  }

  const predictionGroups = asGroups(prediction.group_stage);
  const predictionKnockout = asKnockout(prediction.knockout);

  const resultGroups = asGroups(results?.group_stage);
  const resultKnockout = asKnockout(results?.knockout);

  const chosenGoldenBoot =
    prediction.golden_boot_corrected?.trim() ||
    prediction.golden_boot?.trim() ||
    "";

  const officialGoldenBoot =
    typeof results?.golden_boot === "string" ? results.golden_boot : "";

  const breakdown = scorePrediction(
    predictionGroups,
    predictionKnockout,
    resultGroups,
    resultKnockout,
    chosenGoldenBoot,
    officialGoldenBoot
  );

  return NextResponse.json({
    profile: profile ?? null,
    hasPrediction: true,
    hasOfficialResults: Boolean(results),
    officialResultsReady: Boolean(results),
    prediction: {
      updated_at: prediction.updated_at,
      golden_boot: prediction.golden_boot ?? "",
      golden_boot_corrected: prediction.golden_boot_corrected ?? "",
      chosen_golden_boot: chosenGoldenBoot,
    },
    breakdown,
  });
}