export default function HelpPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-3xl">

        <h1 className="mb-6 text-3xl font-black text-slate-900">
          Så funkar det
        </h1>

        <div className="space-y-6 text-slate-700">

          <section>
            <h2 className="text-xl font-bold text-slate-900">1. Tippa grupper</h2>
            <p className="mt-2 text-sm leading-6">
              Fyll i resultat för alla matcher i gruppspelet. Tabeller räknas ut automatiskt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. Bästa treor</h2>
            <p className="mt-2 text-sm leading-6">
              De bästa treorna går vidare enligt turneringens regler – systemet löser detta åt dig.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. Slutspel</h2>
            <p className="mt-2 text-sm leading-6">
              Välj vilket lag som vinner varje match. Inga resultat behövs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Spara tips</h2>
            <p className="mt-2 text-sm leading-6">
              Glöm inte att spara ditt tips innan deadline.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Följ leaderboard</h2>
            <p className="mt-2 text-sm leading-6">
              När matcherna spelas räknas poängen automatiskt och du kan följa din placering.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}