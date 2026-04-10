import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type JoinedProfile =
  | {
      username: string | null;
      first_name: string | null;
      last_name: string | null;
    }
  | {
      username: string | null;
      first_name: string | null;
      last_name: string | null;
    }[]
  | null;

type LeagueChatRow = {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles: JoinedProfile;
};

function pickProfile(profile: JoinedProfile) {
  if (!profile) return null;
  return Array.isArray(profile) ? profile[0] ?? null : profile;
}

export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || id === "main") {
      return NextResponse.json({ messages: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("league_chat_messages")
      .select(
        `
        id,
        message,
        created_at,
        user_id,
        profiles (
          username,
          first_name,
          last_name
        )
      `
      )
      .eq("league_id", id)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("GET /api/chat/league/[id] error:", error);
      return NextResponse.json(
        { error: "Kunde inte hämta ligachatten." },
        { status: 500 }
      );
    }

    const rows = (data ?? []) as LeagueChatRow[];

    return NextResponse.json({
      messages: rows.map((row) => {
        const profile = pickProfile(row.profiles);

        return {
          id: row.id,
          message: row.message,
          created_at: row.created_at,
          user_id: row.user_id,
          username: profile?.username ?? null,
          first_name: profile?.first_name ?? null,
          last_name: profile?.last_name ?? null,
        };
      }),
    });
  } catch (error) {
    console.error("GET /api/chat/league/[id] crash:", error);
    return NextResponse.json(
      { error: "Något gick fel när ligachatten hämtades." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = context.params;

    if (!id || id === "main") {
      return NextResponse.json(
        { error: "Ingen chat i huvudligan" },
        { status: 400 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
    }

    const body = await req.json();
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { error: "Tomt meddelande" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("league_chat_messages")
      .insert({
        league_id: id,
        user_id: user.id,
        message,
      })
      .select(
        `
        id,
        message,
        created_at,
        user_id,
        profiles (
          username,
          first_name,
          last_name
        )
      `
      )
      .single();

    if (error || !data) {
      console.error("POST /api/chat/league/[id] error:", error);
      return NextResponse.json(
        { error: "Kunde inte skicka" },
        { status: 500 }
      );
    }

    const row = data as LeagueChatRow;
    const profile = pickProfile(row.profiles);

    return NextResponse.json({
      message: {
        id: row.id,
        message: row.message,
        created_at: row.created_at,
        user_id: row.user_id,
        username: profile?.username ?? null,
        first_name: profile?.first_name ?? null,
        last_name: profile?.last_name ?? null,
      },
    });
  } catch (error) {
    console.error("POST /api/chat/league/[id] crash:", error);
    return NextResponse.json(
      { error: "Något gick fel när meddelandet skickades." },
      { status: 500 }
    );
  }
}