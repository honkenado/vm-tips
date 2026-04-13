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
      .from("leagues")
      .select("id, name, join_code, created_by, created_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fel i /api/leagues/my-owned:", error);
      return NextResponse.json(
        { error: "Kunde inte hämta dina ligor" },
        { status: 500 }
      );
    }

    return NextResponse.json({ leagues: data ?? [] });
  } catch (error) {
    console.error("Serverfel:", error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}