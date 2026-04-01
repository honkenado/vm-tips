import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type TeamRow = {
  id: string;
  name: string;
  slug: string;
  group_letter: string;
  fifa_rank: number | null;
  updated_at: string | null;
};

export default async function AdminTeamsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    redirect("/");
  }

  const { data: teams, error } = await supabase
    .from("teams")
    .select("id, name, slug, group_letter, fifa_rank, updated_at")
    .order("group_letter", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Lagadmin</h1>
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Kunde inte läsa lag: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lagadmin</h1>
          <p className="text-sm text-gray-600">
            Hantera lag i databasen.
          </p>
        </div>

        <Link
          href="/admin/teams/new"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          + Nytt lag
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Lag</th>
                <th className="px-4 py-3 font-semibold">Grupp</th>
                <th className="px-4 py-3 font-semibold">Ranking</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Senast uppdaterad</th>
                <th className="px-4 py-3 font-semibold">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {(teams as TeamRow[] | null)?.map((team) => (
                <tr key={team.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{team.name}</td>
                  <td className="px-4 py-3">{team.group_letter}</td>
                  <td className="px-4 py-3">{team.fifa_rank ?? "—"}</td>
                  <td className="px-4 py-3">{team.slug}</td>
                  <td className="px-4 py-3">
                    {team.updated_at
                      ? new Date(team.updated_at).toLocaleString("sv-SE")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/teams/${team.id}`}
                        className="rounded-lg border px-3 py-1.5"
                      >
                        Redigera
                      </Link>

                      <Link
                        href={`/lag/${team.slug}`}
                        className="rounded-lg border px-3 py-1.5"
                      >
                        Visa
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {(!teams || teams.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Inga lag hittades ännu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}