import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_EMOJIS = ["👍", "🔥", "😂", "❤️"] as const;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Du måste vara inloggad." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const messageId =
      typeof body.messageId === "string" ? body.messageId.trim() : "";
    const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "";

    if (!messageId || !emoji) {
      return NextResponse.json(
        { error: "messageId och emoji krävs." },
        { status: 400 }
      );
    }

    if (!ALLOWED_EMOJIS.includes(emoji as (typeof ALLOWED_EMOJIS)[number])) {
      return NextResponse.json(
        { error: "Otillåten reaction." },
        { status: 400 }
      );
    }

    const { data: existingMessage, error: messageError } = await supabaseAdmin
      .from("chat_messages")
      .select("id, scope")
      .eq("id", messageId)
      .maybeSingle();

    if (messageError || !existingMessage) {
      return NextResponse.json(
        { error: "Meddelandet hittades inte." },
        { status: 404 }
      );
    }

    if (existingMessage.scope !== "global") {
      return NextResponse.json(
        { error: "Reaction kan bara sättas på global chat." },
        { status: 400 }
      );
    }

    const { data: existingReaction, error: existingReactionError } =
      await supabaseAdmin
        .from("chat_message_reactions")
        .select("id")
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", emoji)
        .maybeSingle();

    if (existingReactionError) {
      console.error(
        "POST /api/chat/global/reactions existing error:",
        existingReactionError
      );
      return NextResponse.json(
        { error: "Kunde inte kontrollera reaction." },
        { status: 500 }
      );
    }

    if (existingReaction) {
      const { error: deleteError } = await supabaseAdmin
        .from("chat_message_reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (deleteError) {
        console.error(
          "POST /api/chat/global/reactions delete error:",
          deleteError
        );
        return NextResponse.json(
          { error: "Kunde inte ta bort reaction." },
          { status: 500 }
        );
      }

      return NextResponse.json({ toggled: "removed" });
    }

    const { error: insertError } = await supabaseAdmin
      .from("chat_message_reactions")
      .insert({
        message_id: messageId,
        user_id: user.id,
        emoji,
      });

    if (insertError) {
      console.error(
        "POST /api/chat/global/reactions insert error:",
        insertError
      );
      return NextResponse.json(
        { error: "Kunde inte lägga till reaction." },
        { status: 500 }
      );
    }

    return NextResponse.json({ toggled: "added" });
  } catch (error) {
    console.error("POST /api/chat/global/reactions crash:", error);
    return NextResponse.json(
      { error: "Något gick fel med reaction." },
      { status: 500 }
    );
  }
}