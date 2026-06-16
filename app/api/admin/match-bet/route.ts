import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type BetStatus = "pending" | "won" | "lost" | "void";

function calculateProfit(status: BetStatus, odds: number, stake: number) {
  if (status === "won") return (odds - 1) * stake;
  if (status === "lost") return -stake;
  return 0;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("match_bets")
      .select(
        "id, match_number, market, selection, odds, comment, is_active, result_status, stake, settled_at, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const bets = data ?? [];

    const settledBets = bets.filter(
      (bet) => bet.result_status === "won" || bet.result_status === "lost"
    );

    const won = bets.filter((bet) => bet.result_status === "won").length;
    const lost = bets.filter((bet) => bet.result_status === "lost").length;
    const voided = bets.filter((bet) => bet.result_status === "void").length;
    const pending = bets.filter((bet) => bet.result_status === "pending").length;

    const profit = bets.reduce((sum, bet) => {
      return (
        sum +
        calculateProfit(
          bet.result_status as BetStatus,
          Number(bet.odds),
          Number(bet.stake ?? 1)
        )
      );
    }, 0);

    const staked = settledBets.reduce(
      (sum, bet) => sum + Number(bet.stake ?? 1),
      0
    );

    const roi = staked > 0 ? (profit / staked) * 100 : 0;

    return NextResponse.json({
      bets,
      stats: {
        total: bets.length,
        pending,
        won,
        lost,
        voided,
        profit,
        roi,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { matchNumber, market, selection, odds, comment } =
      await request.json();

    const parsedMatchNumber = Number(matchNumber);
    const parsedOdds = Number(odds);

    if (
      !parsedMatchNumber ||
      !market?.trim() ||
      !selection?.trim() ||
      !parsedOdds
    ) {
      return NextResponse.json(
        { error: "Match, marknad, spel och odds måste fyllas i." },
        { status: 400 }
      );
    }

    await supabase
      .from("match_bets")
      .update({ is_active: false })
      .eq("is_active", true);

    const { error } = await supabase.from("match_bets").insert({
      match_number: parsedMatchNumber,
      market: market.trim(),
      selection: selection.trim(),
      odds: parsedOdds,
      comment: comment?.trim() || null,
      is_active: true,
      result_status: "pending",
      stake: 1,
      settled_at: null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const { betId, resultStatus } = await request.json();

    if (!betId) {
      return NextResponse.json({ error: "Saknar betId" }, { status: 400 });
    }

    if (!["pending", "won", "lost", "void"].includes(resultStatus)) {
      return NextResponse.json({ error: "Ogiltig status" }, { status: 400 });
    }

    const { error } = await supabase
      .from("match_bets")
      .update({
        result_status: resultStatus,
        settled_at: resultStatus === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", betId);

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}