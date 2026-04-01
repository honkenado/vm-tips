// lib/supabase/server-readonly.ts

import { createClient } from "@supabase/supabase-js";

export function createReadOnlyClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}