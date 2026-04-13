import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_req: Request) {
  try {
    const supabase = await createClient();

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("id, user_id, message, created_at")
      .eq("scope", "global")
      .order("created_at", { ascending: true })
      .limit(80);

    if (error) {
      console.error("GET /api/chat/global error:", error);
      return NextResponse.json(
        { error: "Kunde inte hämta chatten." },
        { status: 500 }
      );
    }

    const userIds = [...new Set((messages ?? []).map((message) => message.user_id))];

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
        console.error("GET /api/chat/global profiles error:", profilesError);
        return NextResponse.json(
          { error: "Kunde inte hämta profiler till chatten." },
          { status: 500 }
        );
      }

      profiles = profileRows;
    }

    const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

    const hydratedMessages = (messages ?? []).map((message) => {
      const profile = profileMap.get(message.user_id);

      return {
        id: message.id,
        user_id: message.user_id,
        message: message.message,
        created_at: message.created_at,
        username: profile?.username ?? null,
        first_name: profile?.first_name ?? null,
        last_name: profile?.last_name ?? null,
      };
    });

    return NextResponse.json({ messages: hydratedMessages });
  } catch (error) {
    console.error("GET /api/chat/global crash:", error);
    return NextResponse.json(
      { error: "Något gick fel när chatten hämtades." },
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
      return NextResponse.json(
        { error: "Du måste vara inloggad för att skriva i chatten." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawMessage = typeof body.message === "string" ? body.message : "";
    const message = rawMessage.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Skriv ett meddelande först." },
        { status: 400 }
      );
    }

    if (message.length > 400) {
      return NextResponse.json(
        { error: "Meddelandet får vara max 400 tecken." },
        { status: 400 }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: user.id,
        scope: "global",
        message,
      })
      .select("id, user_id, message, created_at")
      .single();

    if (insertError || !inserted) {
      console.error("POST /api/chat/global insert error:", insertError);
      return NextResponse.json(
        { error: "Kunde inte skicka meddelandet." },
        { status: 500 }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, username, first_name, last_name")
      .eq("id", inserted.user_id)
      .maybeSingle();

    return NextResponse.json({
      message: {
        id: inserted.id,
        user_id: inserted.user_id,
        message: inserted.message,
        created_at: inserted.created_at,
        username: profile?.username ?? null,
        first_name: profile?.first_name ?? null,
        last_name: profile?.last_name ?? null,
      },
    });
  } catch (error) {
    console.error("POST /api/chat/global crash:", error);
    return NextResponse.json(
      { error: "Något gick fel när meddelandet skickades." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Du måste vara inloggad för att radera meddelanden." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, role, is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("DELETE /api/chat/global profile error:", profileError);
      return NextResponse.json(
        { error: "Kunde inte kontrollera behörighet." },
        { status: 500 }
      );
    }

    const isAdmin = profile?.role === "admin" || profile?.is_admin === true;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Du har inte behörighet att radera meddelanden." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const messageId =
      typeof body.messageId === "string" ? body.messageId.trim() : "";

    if (!messageId) {
      return NextResponse.json(
        { error: "Meddelande-id saknas." },
        { status: 400 }
      );
    }

    const { data: existingMessage, error: existingError } = await supabaseAdmin
      .from("chat_messages")
      .select("id, scope")
      .eq("id", messageId)
      .maybeSingle();

    if (existingError) {
      console.error("DELETE /api/chat/global existing error:", existingError);
      return NextResponse.json(
        { error: "Kunde inte kontrollera meddelandet." },
        { status: 500 }
      );
    }

    if (!existingMessage) {
      return NextResponse.json(
        { error: "Meddelandet hittades inte." },
        { status: 404 }
      );
    }

    if (existingMessage.scope !== "global") {
      return NextResponse.json(
        { error: "Detta meddelande tillhör inte global chat." },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("chat_messages")
      .delete()
      .eq("id", messageId);

    if (deleteError) {
      console.error("DELETE /api/chat/global delete error:", deleteError);
      return NextResponse.json(
        { error: "Kunde inte radera meddelandet." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/chat/global crash:", error);
    return NextResponse.json(
      { error: "Något gick fel när meddelandet skulle raderas." },
      { status: 500 }
    );
  }
}