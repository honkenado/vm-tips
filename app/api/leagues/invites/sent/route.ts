import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("league_invites")
      .select("id, league_id, invited_user_id, status")
      .eq("invited_by", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Fel i /api/leagues/invites/sent:", error);
      return NextResponse.json(
        { error: "Kunde inte hämta skickade inbjudningar" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invites: data ?? [] });
  } catch (error) {
    console.error("Serverfel i /api/leagues/invites/sent:", error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}