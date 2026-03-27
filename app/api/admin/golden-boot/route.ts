import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

async function getAdminUser(request: NextRequest) {
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
    return { error: "Ej inloggad", status: 401, serviceSupabase, user: null };
  }

  const { data: profile, error: profileError } = await serviceSupabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    return { error: "Ingen behörighet", status: 403, serviceSupabase, user };
  }

  return { error: null, status: 200, serviceSupabase, user };
}

export async function GET(request: NextRequest) {
  const authResult = await getAdminUser(request);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const supabase = authResult.serviceSupabase;

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

  const { data: resultsRow, error: resultsError } = await supabase
    .from("tournament_results")
    .select("golden_boot")
    .eq("tournament_id", tournament.id)
    .maybeSingle();

  if (resultsError) {
    return NextResponse.json(
      { error: resultsError.message },
      { status: 500 }
    );
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, username, payment_status")
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

  const predictionMap = new Map(
    (predictions ?? []).map((prediction) => [prediction.user_id, prediction])
  );

  const entries = (profiles ?? []).map((profile) => {
    const prediction = predictionMap.get(profile.id);

    return {
      user_id: profile.id,
      name:
        `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
        profile.username ||
        "Namn saknas",
      payment_status: profile.payment_status ?? "unpaid",
      golden_boot: prediction?.golden_boot ?? "",
      golden_boot_corrected: prediction?.golden_boot_corrected ?? "",
    };
  });

  return NextResponse.json({
    officialGoldenBoot: resultsRow?.golden_boot ?? "",
    entries,
  });
}

export async function POST(request: NextRequest) {
  const authResult = await getAdminUser(request);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const supabase = authResult.serviceSupabase;
  const body = await request.json();

  const userId =
    typeof body.userId === "string" ? body.userId.trim() : "";
  const correctedGoldenBoot =
    typeof body.correctedGoldenBoot === "string"
      ? body.correctedGoldenBoot.trim()
      : "";
  const officialGoldenBoot =
    typeof body.officialGoldenBoot === "string"
      ? body.officialGoldenBoot.trim()
      : "";
  const mode =
    typeof body.mode === "string" ? body.mode.trim() : "";

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

  if (mode === "prediction") {
    if (!userId) {
      return NextResponse.json(
        { error: "Saknar userId" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("predictions")
      .update({
        golden_boot_corrected: correctedGoldenBoot || null,
      })
      .eq("user_id", userId)
      .eq("tournament_id", tournament.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (mode === "official") {
    const { error } = await supabase
      .from("tournament_results")
      .upsert(
        {
          tournament_id: tournament.id,
          golden_boot: officialGoldenBoot || null,
        },
        { onConflict: "tournament_id" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Ogiltigt mode" }, { status: 400 });
}