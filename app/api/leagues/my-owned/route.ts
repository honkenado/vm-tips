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
      return NextResponse.json({ leagues: [] });
    }

    const { data, error } = await supabase
      .from("leagues")
      .select("*");

    if (error) {
      console.error("DB error i /api/leagues/my-owned:", error);
      return NextResponse.json({ leagues: [] });
    }

    const owned = (data ?? []).filter((league) => league.created_by === user.id);

    return NextResponse.json({ leagues: owned });
  } catch (error) {
    console.error("Server error i /api/leagues/my-owned:", error);
    return NextResponse.json({ leagues: [] });
  }
}