// lib/match-schedule.ts

import { initialGroups } from "@/lib/tournament";

export type ScheduleMatch = {
  id: string;
  matchNumber: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  stage: "group";
  groupLetter: string;
  groupName: string;
  tvChannel?: string;
};

const DEFAULT_TV_CHANNEL = "TV-kanal saknas";

function getGroupLetter(groupName: string) {
  return groupName.replace("Grupp ", "").trim();
}

export function getGroupStageSchedule(): ScheduleMatch[] {
  return initialGroups
    .flatMap((group) =>
      group.matches.map((match) => ({
        id: `group-${match.matchNumber}`,
        matchNumber: match.matchNumber,
        date: match.date,
        time: match.time,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        stage: "group" as const,
        groupLetter: getGroupLetter(group.name),
        groupName: group.name,
        tvChannel: DEFAULT_TV_CHANNEL,
      }))
    )
    .sort((a, b) => a.matchNumber - b.matchNumber);
}