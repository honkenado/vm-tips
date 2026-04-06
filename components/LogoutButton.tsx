"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({
  className,
  children = "Logga ut",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}