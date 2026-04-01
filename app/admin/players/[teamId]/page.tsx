import TeamPlayersManager from "@/components/admin/TeamPlayersManager";

export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-white text-2xl font-bold">Spelare</h1>

      <TeamPlayersManager teamId={teamId} />
    </div>
  );
}