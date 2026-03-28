import { redirect } from "next/navigation";
import PredictionPrintActions from "@/components/PredictionPrintActions";
import PredictionPrintDocument from "@/components/PredictionPrintDocument";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getDisplayName(profile: {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email?: string | null;
}) {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();

  if (fullName) return fullName;
  if (profile.username) return profile.username;
  if (profile.email) return profile.email;
  return "Okänd användare";
}

export default async function PredictionPdfPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [{ data: profile, error: profileError }, { data: prediction, error: predictionError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, last_name, username, email")
        .eq("id", user.id)
        .single(),
      supabase
        .from("predictions")
        .select(
          "group_stage, knockout, golden_boot, golden_boot_corrected, updated_at, tournament_id",
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (profileError) {
    throw new Error(`Kunde inte läsa profil: ${profileError.message}`);
  }

  if (predictionError) {
    throw new Error(`Kunde inte läsa prediction: ${predictionError.message}`);
  }

  if (!prediction) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <PredictionPrintActions />
          <h1 className="text-2xl font-bold text-slate-900">Inget sparat tips hittades</h1>
          <p className="mt-2 text-sm text-slate-600">
            Du behöver spara ett tips innan du kan skriva ut eller exportera det som PDF.
          </p>
        </div>
      </main>
    );
  }

  const profileName = getDisplayName(profile);
  const groups = Array.isArray(prediction.group_stage) ? prediction.group_stage : [];
  const knockout =
    prediction.knockout && typeof prediction.knockout === "object"
      ? (prediction.knockout as Record<string, string>)
      : {};

  const goldenBoot =
    prediction.golden_boot_corrected || prediction.golden_boot || null;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-6xl">
        <PredictionPrintActions />

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <PredictionPrintDocument
            profileName={profileName}
            updatedAt={prediction.updated_at}
            goldenBoot={goldenBoot}
            groups={groups}
            knockout={knockout}
          />
        </div>
      </div>
    </main>
  );
}