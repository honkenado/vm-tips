import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("news_posts")
      .select("id, title, content, image_url, is_published, created_at, updated_at")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Nyheten hittades inte" },
        { status: 404 }
      );
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("Fel i GET /api/news/[id]:", error);
    return NextResponse.json(
      { error: "Något gick fel när nyheten hämtades" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profil hittades inte" }, { status: 404 });
    }

    if (!profile.is_admin) {
      return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
    }

    const { error } = await supabase
      .from("news_posts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Kunde inte radera nyheten" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Nyheten raderades" });
  } catch (error) {
    console.error("Fel i DELETE /api/news/[id]:", error);
    return NextResponse.json(
      { error: "Något gick fel när nyheten raderades" },
      { status: 500 }
    );
  }
}