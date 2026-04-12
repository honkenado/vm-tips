import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Ingen fil skickades med." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Filen måste vara en bild." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Bilden är för stor. Max 10 MB." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const safeName = sanitizeFileName(file.name);
    const filePath = `news/${timestamp}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Kunde inte ladda upp bilden." },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("news-images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      path: filePath,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Något gick fel vid uppladdning." },
      { status: 500 }
    );
  }
}