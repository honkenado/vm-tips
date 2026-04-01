// lib/match-utils.ts

import type { ScheduleMatch } from "@/lib/match-schedule";

const MONTHS_SV: Record<string, number> = {
  januari: 0,
  februari: 1,
  mars: 2,
  april: 3,
  maj: 4,
  juni: 5,
  juli: 6,
  augusti: 7,
  september: 8,
  oktober: 9,
  november: 10,
  december: 11,
};

export function parseSwedishMatchDate(date: string, time: string) {
  const parts = date.toLowerCase().trim().split(" ");
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = MONTHS_SV[parts[1]];
  const year = Number(parts[2]);

  if (
    Number.isNaN(day) ||
    typeof month !== "number" ||
    Number.isNaN(year)
  ) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

export function sortMatchesByDateTime(matches: ScheduleMatch[]) {
  return [...matches].sort((a, b) => {
    const dateA = parseSwedishMatchDate(a.date, a.time);
    const dateB = parseSwedishMatchDate(b.date, b.time);

    if (!dateA && !dateB) return a.matchNumber - b.matchNumber;
    if (!dateA) return 1;
    if (!dateB) return -1;

    return dateA.getTime() - dateB.getTime();
  });
}

export function getTodayDateStringSv() {
  const now = new Date();
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Stockholm",
  }).format(now);
}

export function getMatchesToday(matches: ScheduleMatch[]) {
  const today = getTodayDateStringSv().toLowerCase();
  return sortMatchesByDateTime(
    matches.filter((match) => match.date.toLowerCase() === today)
  );
}

export function groupMatchesByDate(matches: ScheduleMatch[]) {
  const sorted = sortMatchesByDateTime(matches);

  return sorted.reduce<Record<string, ScheduleMatch[]>>((acc, match) => {
    if (!acc[match.date]) {
      acc[match.date] = [];
    }
    acc[match.date].push(match);
    return acc;
  }, {});
}