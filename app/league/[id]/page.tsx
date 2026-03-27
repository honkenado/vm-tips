export default async function LeaguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Ligasida fungerar</h1>
      <p>ID: {id}</p>
    </main>
  );
}