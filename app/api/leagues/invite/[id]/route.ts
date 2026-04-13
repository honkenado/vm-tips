import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Inbjudnings-id saknas" },
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

    const { data: invite, error: inviteError } = await supabase
      .from("league_invites")
      .select("id, invited_by, status")
      .eq("id", id)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Inbjudan hittades inte" },
        { status: 404 }
      );
    }

    if (invite.invited_by !== user.id) {
      return NextResponse.json(
        { error: "Du får inte ta bort denna inbjudan" },
        { status: 403 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "Bara väntande inbjudningar kan ångras" },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from("league_invites")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Fel vid delete av invite:", deleteError);
      return NextResponse.json(
        { error: "Kunde inte ångra inbjudan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Serverfel i /api/leagues/invite/[id]:", error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}