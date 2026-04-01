import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TeamPlayersManager from "@/components/admin/TeamPlayersManager";

export default async function TeamPlayersPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const supabase = await createClient();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name")
    .eq("id", teamId)
    .single();

  if (teamError || !team) {
    notFound();
  }

  const { data: players, error: playersError } = await supabase
    .from("team_players")
    .select("*")
    .eq("team_id", teamId)
    .order("player_order", { ascending: true })
    .order("shirt_number", { ascending: true });

  if (playersError) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Spelare</h1>
        <p className="text-sm text-gray-400">{team.name}</p>
      </div>

      <TeamPlayersManager teamId={team.id} initialPlayers={players ?? []} />
    </div>
  );
}