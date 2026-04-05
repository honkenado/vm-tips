import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type LeagueRow = {
  id: string;
  name: string;
  join_code: string;
  created_by: string | null;
  created_at: string | null;
};

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
      .select(
        `
          league_id,
          leagues (
            id,
            name,
            join_code,
            created_by,
            created_at
          )
        `
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("Fel i /api/leagues/my:", error);
      return NextResponse.json({ error: "Kunde inte hämta ligor" }, { status: 500 });
    }

    const memberLeagues: LeagueRow[] = (data ?? [])
      .map((item: any) => {
        const league = Array.isArray(item.leagues) ? item.leagues[0] : item.leagues;
        if (!league) return null;

        return {
          id: league.id,
          name: league.name,
          join_code: league.join_code,
          created_by: league.created_by ?? null,
          created_at: league.created_at ?? null,
        };
      })
      .filter(Boolean) as LeagueRow[];

    const leagues: LeagueRow[] = [
      {
        id: "main",
        name: "Huvudligan",
        join_code: "MAIN",
        created_by: null,
        created_at: null,
      },
      ...memberLeagues,
    ];

    return NextResponse.json({ leagues });
  } catch (error) {
    console.error("Serverfel i /api/leagues/my:", error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}