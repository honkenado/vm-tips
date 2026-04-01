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
      <div className="text-red-600">
        Fel: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Lag</h1>

        <Link
          href="/admin/teams/new"
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + Nytt lag
        </Link>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {(teams ?? []).map((team) => (
          <div
            key={team.id}
            className="p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{team.name}</div>
              <div className="text-sm text-gray-500">
                Grupp {team.group_letter} • Ranking {team.fifa_rank ?? "-"}
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/teams/${team.id}`}
                className="border px-3 py-1 rounded"
              >
                Redigera
              </Link>

              <Link
                href={`/lag/${team.slug}`}
                className="border px-3 py-1 rounded"
              >
                Visa
              </Link>
            </div>
          </div>
        ))}

        {(!teams || teams.length === 0) && (
          <div className="p-6 text-gray-500 text-center">
            Inga lag ännu
          </div>
        )}
      </div>
    </div>
  );
}