import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTeamsPage() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return (
        <main className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold">Lagadmin</h1>
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Fel vid hämtning av användare: {userError.message}
          </p>
        </main>
      );
    }

    if (!user) {
      redirect("/login");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return (
        <main className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold">Lagadmin</h1>
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Fel i profiles: {profileError.message}
          </p>
        </main>
      );
    }

    if (!profile?.is_admin) {
      redirect("/");
    }

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, slug, group_letter, fifa_rank")
      .order("group_letter", { ascending: true })
      .order("name", { ascending: true });

    if (teamsError) {
      return (
        <main className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold">Lagadmin</h1>
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Fel i teams: {teamsError.message}
          </p>
        </main>
      );
    }

    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lagadmin</h1>
            <p className="text-sm text-gray-600">Hantera lag i databasen.</p>
          </div>

          <Link
            href="/admin/teams/new"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
          >
            + Nytt lag
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
          <div className="divide-y">
            {(teams ?? []).map((team) => (
              <div
                key={team.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-gray-600">
                    Grupp {team.group_letter} • Ranking {team.fifa_rank ?? "—"} • {team.slug}
                  </p>
                </div>

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
              </div>
            ))}

            {(!teams || teams.length === 0) && (
              <div className="px-4 py-8 text-center text-gray-500">
                Inga lag hittades ännu.
              </div>
            )}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold">Lagadmin</h1>
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Oväntat serverfel: {error instanceof Error ? error.message : "Okänt fel"}
        </p>
      </main>
    );
  }
}