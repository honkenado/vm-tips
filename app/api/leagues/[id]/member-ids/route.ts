import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "League-id saknas" },
        { status: 400 }
      );
    }

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
      .select("user_id")
      .eq("league_id", id);

    if (error) {
      console.error("Fel i /api/leagues/[id]/member-ids:", error);
      return NextResponse.json(
        { error: "Kunde inte hämta ligamedlemmar" },
        { status: 500 }
      );
    }

    const memberIds = (data ?? []).map((row) => row.user_id);

    return NextResponse.json({ memberIds });
  } catch (error) {
    console.error("Serverfel i /api/leagues/[id]/member-ids:", error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}