import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { matchNumber, market, selection, odds, comment } =
      await request.json();

    if (!matchNumber || !market || !selection || !odds) {
      return NextResponse.json(
        { error: "Match, marknad, spel och odds måste fyllas i." },
        { status: 400 }
      );
    }

    await supabase
      .from("match_bets")
      .update({ is_active: false })
      .eq("is_active", true)
      .eq("match_number", matchNumber);

    const { error } = await supabase.from("match_bets").insert({
      match_number: matchNumber,
      market,
      selection,
      odds,
      comment,
      is_active: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}
export async function DELETE() {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("match_bets")
      .update({ is_active: false })
      .eq("is_active", true);

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