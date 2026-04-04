import ImportAllPlayersButton from "@/components/admin/ImportAllPlayersButton";

export default function AdminPlayersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-white text-2xl font-bold">Spelare</h1>

      <ImportAllPlayersButton />
    </div>
  );
}