import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type DbProfileRow = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  role: string | null;
};

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name, created_at, role")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const members = ((profiles ?? []) as DbProfileRow[]).map((profile, index) => {
    const fullName =
      `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
      profile.username ||
      "Namn saknas";

    return {
      id: profile.id,
      username: profile.username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      created_at: profile.created_at,
      display_name: fullName,
      member_number: index + 1,
    };
  });

  return NextResponse.json({ members });
}