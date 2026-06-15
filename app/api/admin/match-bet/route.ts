import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      market,
      selection,
      odds,
      comment,
    } = await request.json();

    await supabase
      .from("match_bets")
      .update({ is_active: false })
      .eq("is_active", true);

    const { error } = await supabase
      .from("match_bets")
      .insert({
        market,
        selection,
        odds,
        comment,
        is_active: true,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfel" },
      { status: 500 }
    );
  }
}