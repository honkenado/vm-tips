import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  inviteId?: string;
  action?: "accepted" | "declined";
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const inviteId = body.inviteId?.trim();
    const action = body.action;

    if (!inviteId || !action || !["accepted", "declined"].includes(action)) {
      return NextResponse.json(
        { error: "inviteId och action krävs" },
        { status: 400 }
      );
    }

    const { data: invite, error: inviteError } = await supabase
      .from("league_invites")
      .select("id, league_id, invited_user_id, status")
      .eq("id", inviteId)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: "Inbjudan hittades inte" }, { status: 404 });
    }

    if (invite.invited_user_id !== user.id) {
      return NextResponse.json(
        { error: "Du kan inte svara på denna inbjudan" },
        { status: 403 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "Inbjudan är redan besvarad" },
        { status: 400 }
      );
    }

    if (action === "accepted") {
      const { data: existingMember, error: memberCheckError } = await supabase
        .from("league_members")
        .select("league_id")
        .eq("league_id", invite.league_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberCheckError) {
        console.error("Fel vid medlemskontroll:", memberCheckError);
        return NextResponse.json(
          { error: "Kunde inte kontrollera medlemskap" },
          { status: 500 }
        );
      }

      if (!existingMember) {
        const { error: insertMemberError } = await supabase
          .from("league_members")
          .insert({
            league_id: invite.league_id,
            user_id: user.id,
          });

        if (insertMemberError) {
          console.error("Fel vid tillägg till league_members:", insertMemberError);
          return NextResponse.json(
            { error: "Kunde inte lägga till medlem i ligan" },
            { status: 500 }
          );
        }
      }
    }

    const { error: updateError } = await supabase
      .from("league_invites")
      .update({
        status: action,
        responded_at: new Date().toISOString(),
      })
      .eq("id", inviteId);

    if (updateError) {
      console.error("Fel vid uppdatering av inbjudan:", updateError);
      return NextResponse.json(
        { error: "Kunde inte uppdatera inbjudan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Serverfel i /api/leagues/invites/respond:", error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}