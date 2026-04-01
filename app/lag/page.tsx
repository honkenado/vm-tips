// app/lag/page.tsx

import TeamGroupGrid from "@/components/teams/TeamGroupGrid";
import { getTeamsGroupedByLetter } from "@/lib/teams";

export const metadata = {
  title: "Lag & spelare | Addes VM-tips",
  description: "Se alla VM-lag, grupper och trupper.",
};

export default function TeamsPage() {
  const grouped = getTeamsGroupedByLetter();
  const groupLetters = Object.keys(grouped).sort();

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Lag & spelare
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Här hittar du alla lag i turneringen. Klicka på ett lag för att se
          trupp, statistik och senare även vägen till VM.
        </p>
      </div>

      <div className="grid gap-6">
        {groupLetters.map((letter) => (
          <TeamGroupGrid
            key={letter}
            groupLetter={letter}
            teams={grouped[letter]}
          />
        ))}
      </div>
    </main>
  );
}