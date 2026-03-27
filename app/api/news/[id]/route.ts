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