import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ONLINE_WINDOW_SECONDS = 120;

export async function GET() {
  try {
    const cutoff = new Date(Date.now() - ONLINE_WINDOW_SECONDS * 1000).toISOString();

    const { data: presenceRows, error: presenceError } = await supabaseAdmin
      .from("user_presence")
      .select("user_id, page, last_seen")
      .gte("last_seen", cutoff)
      .order("last_seen", { ascending: false })
      .limit(30);

    if (presenceError) {
      console.error("GET /api/presence error:", presenceError);
      return NextResponse.json(
        { error: "Kunde inte hämta online-status." },
        { status: 500 }
      );
    }

    const userIds = [...new Set((presenceRows ?? []).map((row) => row.user_id))];

    let profiles:
      | Array<{
          id: string;
          username: string | null;
          first_name: string | null;
          last_name: string | null;
        }>
      | null = [];

    if (userIds.length > 0) {
      const { data: profileRows, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id, username, first_name, last_name")
        .in("id", userIds);

      if (profilesError) {
        console.error("GET /api/presence profiles error:", profilesError);
        return NextResponse.json(
          { error: "Kunde inte hämta profiler." },
          { status: 500 }
        );
      }

      profiles = profileRows;
    }

    const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

    const onlineUsers = (presenceRows ?? [])
      .map((row) => {
        const profile = profileMap.get(row.user_id);

        return {
          user_id: row.user_id,
          page: row.page ?? null,
          last_seen: row.last_seen,
          username: profile?.username ?? null,
          first_name: profile?.first_name ?? null,
          last_name: profile?.last_name ?? null,
        };
      })
      .filter((row) => row.username || row.first_name || row.last_name);

    return NextResponse.json({
      users: onlineUsers,
      count: onlineUsers.length,
    });
  } catch (error) {
    console.error("GET /api/presence crash:", error);
    return NextResponse.json(
      { error: "Något gick fel när online-status hämtades." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ ok: true });
    }

    const body = await req.json().catch(() => ({}));
    const page = typeof body.page === "string" ? body.page.trim() : "home";

    const { error } = await supabaseAdmin
      .from("user_presence")
      .upsert(
        {
          user_id: user.id,
          page: page || "home",
          last_seen: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("POST /api/presence error:", error);
      return NextResponse.json(
        { error: "Kunde inte uppdatera online-status." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/presence crash:", error);
    return NextResponse.json(
      { error: "Något gick fel vid uppdatering av online-status." },
      { status: 500 }
    );
  }
}