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
      console.log("❌ No user");
      return NextResponse.json({ leagues: [] });
    }

    console.log("✅ USER ID:", user.id);

    const { data, error } = await supabase
      .from("leagues")
      .select("*");

    if (error) {
      console.error("DB error:", error);
      return NextResponse.json({ leagues: [] });
    }

    console.log("ALL LEAGUES:", data);

    // 🔥 filtrera i kod istället (mycket säkrare)
    const owned = (data ?? []).filter(
      (l) => l.created_by === user.id
    );

    console.log("OWNED LEAGUES:", owned);

    return NextResponse.json({ leagues: owned });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ leagues: [] });
  }
}