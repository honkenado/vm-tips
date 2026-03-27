"use client";

import Image from "next/image";
import AuthStatus from "@/components/auth-status";
import BestThirdsSection from "@/components/BestThirdsSection";
import GroupSection from "@/components/GroupSection";
import KnockoutFullSection from "@/components/KnockoutFullSection";
import LeaguesSection from "@/components/leagues-section";
import NewsPreview from "@/components/NewsPreview";
import QualifiedTeamsSection from "@/components/QualifiedTeamsSection";
import SectionCard from "@/components/SectionCard";
import { useEffect, useMemo, useState } from "react";
import { isDeadlinePassed } from "@/lib/config";
import {
  clearDependentKnockoutSelections,
  buildNextRound,
  generateRandomScore,
  getKnockoutSeedData,
  getLoser,
  initialGroups,
  isGroupComplete,
  isTournamentGroupStageComplete,
  pickRandomWinner,
} from "@/lib/tournament";
import type { GroupData, KnockoutMatch } from "@/types/tournament";

type AppViewMode = "all" | "groups" | "thirds" | "knockout" | "leagues";

export default function HomePage() {
  const [groups, setGroups] = useState<GroupData[]>(initialGroups);
  const [knockoutWinners, setKnockoutWinners] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<AppViewMode>("all");
  const [activeGroupLetter, setActiveGroupLetter] = useState("A");

  const isGroupStageComplete = useMemo(
    () => isTournamentGroupStageComplete(groups),
    [groups]
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#d1fae5_0%,_#ecfdf5_40%,_#f8fafc_100%)] px-3 py-3 md:px-6 md:py-8">

      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}
        <header className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 p-6 text-white shadow-xl">

          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">

            {/* LEFT SIDE */}
            <div className="flex flex-col gap-3">

              <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/80">
                FIFA World Cup 2026
              </div>

              {/* LOGO */}
              <div className="flex items-center justify-center md:justify-start">
                <Image
                  src="/logo.png"
                  alt="Addes VM tips"
                  width={220}
                  height={220}
                  priority
                  className="h-auto w-[140px] sm:w-[180px] md:w-[220px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
                />
              </div>

              <p className="max-w-xl text-sm text-white/80">
                Tippa grupper, följ de bästa treorna och spela hela slutspelet fram till världsmästaren.
              </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex justify-end">
              <AuthStatus />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900">
              Spara tips
            </button>
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm">
              Skapa liga
            </button>
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm">
              Gå med i liga
            </button>
            <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold">
              Adde Boy
            </button>
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm">
              Nollställ
            </button>
          </div>
        </header>

        {/* NEWS */}
        <NewsPreview />

        {/* CONTENT */}
        <div className="grid gap-6 mt-6">

          <SectionCard title="Grupper" subtitle="Välj grupp och fyll i dina matchresultat.">
            <GroupSection
              group={groups[0]}
              onUpdateMatch={() => {}}
              onResetGroup={() => {}}
            />
          </SectionCard>

          <BestThirdsSection groups={groups} />
          <QualifiedTeamsSection groups={groups} />

          <KnockoutFullSection
            groups={groups}
            knockoutWinners={knockoutWinners}
            onSelectWinner={() => {}}
            onResetKnockout={() => {}}
            isGroupStageComplete={isGroupStageComplete}
          />

          <LeaguesSection myLeagues={[]} />

        </div>
      </div>
    </main>
  );
}