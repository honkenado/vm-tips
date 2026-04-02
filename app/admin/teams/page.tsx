import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTeamsPage() {
  const supabase = await createClient();

  const { data: teams, error } = await supabase
    .from("teams")
    .select("id, name, slug, group_letter, fifa_rank")
    .order("group_letter", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
        Fel: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Lag</h1>

        <Link
          href="/admin/teams/new"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + Nytt lag
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
        {(teams ?? []).map((team, index) => (
          <div
            key={team.id}
            className={`flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
              index !== 0 ? "border-t border-gray-200" : ""
            } ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
          >
            <div>
              <div className="text-base font-semibold text-black">
                {team.name}
              </div>
              <div className="text-sm text-gray-700">
                Grupp {team.group_letter} • Ranking {team.fifa_rank ?? "-"}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/teams/${team.id}`}
                className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-medium text-black transition hover:bg-gray-200"
              >
                Redigera
              </Link>

              <Link
                href={`/admin/players/${team.id}`}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-black transition hover:bg-gray-100"
              >
                Spelare
              </Link>

              <Link
                href={`/lag/${team.slug}`}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-black transition hover:bg-gray-100"
              >
                Visa
              </Link>
            </div>
          </div>
        ))}

        {(!teams || teams.length === 0) && (
          <div className="p-6 text-center text-gray-600">Inga lag ännu</div>
        )}
      </div>
    </div>
  );
}