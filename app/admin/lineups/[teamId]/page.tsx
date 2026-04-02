import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LineupEditor from "@/components/admin/LineupEditor";

export default async function AdminLineupPage({
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
    .select("id, team_id, name, position, shirt_number")
    .eq("team_id", teamId)
    .order("player_order", { ascending: true });

  if (playersError) {
    notFound();
  }

  const { data: lineup } = await supabase
    .from("team_lineups")
    .select("id, formation, lineup_name")
    .eq("team_id", teamId)
    .eq("lineup_name", "Startelva")
    .maybeSingle();

  let initialSlots: any[] = [];

  if (lineup?.id) {
    const { data: slots } = await supabase
      .from("team_lineup_slots")
      .select("slot_key, role_label, x_pos, y_pos, player_id")
      .eq("lineup_id", lineup.id);

    initialSlots = slots ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Laguppställning</h1>
        <p className="text-sm text-gray-400">{team.name}</p>
      </div>

      <LineupEditor
        teamId={team.id}
        players={players ?? []}
        initialFormation={lineup?.formation ?? "4-3-3"}
        initialSlots={initialSlots}
      />
    </div>
  );
}