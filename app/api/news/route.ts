import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("news_posts")
      .select("id, title, content, image_url, is_published, created_at, updated_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Kunde inte hämta nyheter" },
        { status: 500 }
      );
    }

    return NextResponse.json({ posts: data ?? [] });
  } catch (error) {
    console.error("Fel i GET /api/news:", error);
    return NextResponse.json(
      { error: "Något gick fel när nyheterna hämtades" },
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

    const body = await req.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const imageUrl =
      typeof body.image_url === "string" && body.image_url.trim() !== ""
        ? body.image_url.trim()
        : null;
    const isPublished =
      typeof body.is_published === "boolean" ? body.is_published : true;

    if (title.length < 3) {
      return NextResponse.json(
        { error: "Rubriken måste vara minst 3 tecken" },
        { status: 400 }
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        { error: "Innehållet måste vara minst 10 tecken" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("news_posts")
      .insert({
        title,
        content,
        image_url: imageUrl,
        is_published: isPublished,
        created_by: user.id,
      })
      .select("id, title, content, image_url, is_published, created_at, updated_at")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Kunde inte skapa nyhet" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Nyhet skapad",
      post: data,
    });
  } catch (error) {
    console.error("Fel i POST /api/news:", error);
    return NextResponse.json(
      { error: "Något gick fel när nyheten skapades" },
      { status: 500 }
    );
  }
}