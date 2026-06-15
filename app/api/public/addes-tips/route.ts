import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TOURNAMENT_SLUG = "world-cup-2026";
const ADDE_USERNAME = "honkenado";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name")
    .eq("username", ADDE_USERNAME)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Kunde inte hitta Addes profil" },
      { status: 404 }
    );
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id")
    .eq("slug", TOURNAMENT_SLUG)
    .maybeSingle();

  if (tournamentError || !tournament) {
    return NextResponse.json(
      { error: "Kunde inte hitta turneringen" },
      { status: 404 }
    );
  }

  const { data: prediction, error: predictionError } = await supabase
    .from("predictions")
    .select("group_stage, knockout, golden_boot, golden_boot_corrected, updated_at")
    .eq("user_id", profile.id)
    .eq("tournament_id", tournament.id)
    .maybeSingle();

  if (predictionError || !prediction) {
    return NextResponse.json(
      { error: "Kunde inte hitta Addes tips" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    profile: {
      name:
        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        profile.username ||
        "Adde",
      username: profile.username,
    },
    prediction: {
      groupStage: prediction.group_stage ?? [],
      knockout: prediction.knockout ?? {},
      goldenBoot:
        prediction.golden_boot_corrected ||
        prediction.golden_boot ||
        "Ej valt",
      updatedAt: prediction.updated_at,
    },
  });
}