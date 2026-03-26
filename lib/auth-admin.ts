import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  is_admin: boolean | null;
};

export async function requireAdmin(): Promise<AdminProfile> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, username, is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_admin) {
    redirect("/");
  }

  return profile as AdminProfile;
}