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
      .select(`
        id,
        status,
        created_at,
        invited_by,
        league_id,
        leagues:league_id (
          id,
          name
        ),
        inviter:invited_by (
          id,
          first_name,
          last_name
        )
      `)
      .eq("invited_user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fel i /api/leagues/invites:", error);
      return NextResponse.json(
        { error: "Kunde inte hämta inbjudningar" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invites: data ?? [] });
  } catch (error) {
    console.error("Serverfel i /api/leagues/invites:", error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}