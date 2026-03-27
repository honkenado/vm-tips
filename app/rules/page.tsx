export default function RulesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-3xl">

        <h1 className="mb-6 text-3xl font-black text-slate-900">
          Regler & Poängsystem
        </h1>

        <div className="space-y-6 text-slate-700">

          <section>
            <h2 className="text-xl font-bold text-slate-900">Grundregler</h2>
            <ul className="mt-2 list-disc pl-5 text-sm leading-6">
              <li>Du tippar alla matcher i gruppspelet med exakta resultat.</li>
              <li>Slutspelet tippar du endast vinnare (inte resultat).</li>
              <li>Tipset låses vid deadline.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Poängsystem</h2>
            <ul className="mt-2 list-disc pl-5 text-sm leading-6">
              <li><strong>3 poäng</strong> – rätt utgång (1X2)</li>
              <li><strong>+1 poäng</strong> – exakt resultat</li>
              <li>Max 4 poäng per match</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Slutspel</h2>
            <ul className="mt-2 list-disc pl-5 text-sm leading-6">
              <li>Rätt lag vidare ger poäng</li>
              <li>Ju längre fram desto mer värde</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Särskiljning</h2>
            <ul className="mt-2 list-disc pl-5 text-sm leading-6">
              <li>Totalpoäng avgör placering</li>
              <li>Vid lika poäng används målskillnad i gruppspelet</li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}