require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const firstNames = [
  "Erik",
  "Anton",
  "Joel",
  "Lucas",
  "Milo",
  "William",
  "Adam",
  "Viktor",
  "Oskar",
  "Albin",
];

const lastNames = [
  "Andersson",
  "Johansson",
  "Karlsson",
  "Nilsson",
  "Lindberg",
  "Holm",
  "Sundström",
  "Berg",
  "Ekman",
  "Wallin",
];

async function run() {
  for (let i = 1; i <= 50; i++) {
    const first =
      firstNames[Math.floor(Math.random() * firstNames.length)];

    const last =
      lastNames[Math.floor(Math.random() * lastNames.length)];

    const name = `${first} ${last} ${i}`;

    const email = `testuser${i}@vmtips.se`;

    const password = "Test123456!";

    console.log(`Creating ${name}`);

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.log(authError.message);
      continue;
    }

    const userId = authData.user.id;

    await supabase.from("profiles").upsert({
      id: userId,
      full_name: name,
      payment_status: "paid",
      is_test_user: true,
    });

    console.log(`Done ${name}`);
  }

  console.log("Finished");
}

run();