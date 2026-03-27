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
      .from("league_members")
      .select(`
        league_id,
        leagues (
          id,
          name,
          join_code,
          created_by,
          created_at
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Kunde inte hämta ligor" }, { status: 500 });
    }

    const leagues = data.map((item) => item.leagues);

    return NextResponse.json({ leagues });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}