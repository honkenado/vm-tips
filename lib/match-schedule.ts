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
  streamingChannel?: string;
};

const DEFAULT_TV_CHANNEL = "TV-kanal saknas";
const DEFAULT_STREAMING_CHANNEL = "";

const tvChannelByMatchNumber: Record<number, string> = {
  // Exempel – fyll på efterhand
  1: "TV4",
  2: "TV4 Play",
  3: "SVT1",
  4: "SVT2",
  5: "TV6",
  6: "Viaplay",
  7: "TV4",
  8: "TV4 Play",
  9: "SVT1",
  10: "SVT2",
  11: "TV6",
  12: "Viaplay",
};

const streamingChannelByMatchNumber: Record<number, string> = {
  // Exempel – fyll på efterhand
  1: "TV4 Play",
  2: "TV4 Play",
  3: "SVT Play",
  4: "SVT Play",
  5: "Viaplay",
  6: "Viaplay",
};

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
        tvChannel: tvChannelByMatchNumber[match.matchNumber] ?? DEFAULT_TV_CHANNEL,
        streamingChannel:
          streamingChannelByMatchNumber[match.matchNumber] ??
          DEFAULT_STREAMING_CHANNEL,
      }))
    )
    .sort((a, b) => a.matchNumber - b.matchNumber);
}

export function getScheduleMatchByNumber(matchNumber: number) {
  return getGroupStageSchedule().find((match) => match.matchNumber === matchNumber);
}