require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_test_user", true);

  if (error) {
    console.log(error);
    return;
  }

  for (const profile of profiles) {
    console.log("Deleting", profile.id);

    await supabase.auth.admin.deleteUser(profile.id);
  }

  console.log("Finished");
}

run();