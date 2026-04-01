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

function parseSwedishDateParts(date: string) {
  const parts = date.toLowerCase().trim().split(" ");
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = MONTHS_SV[parts[1]];
  const year = Number(parts[2]);

  if (Number.isNaN(day) || typeof month !== "number" || Number.isNaN(year)) {
    return null;
  }

  return { year, month, day };
}

export function parseSwedishMatchDate(date: string, time: string) {
  const dateParts = parseSwedishDateParts(date);
  if (!dateParts) return null;

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return new Date(
    dateParts.year,
    dateParts.month,
    dateParts.day,
    hours,
    minutes,
    0,
    0
  );
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

function getTodayPartsInStockholm() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value) - 1;
  const day = Number(parts.find((p) => p.type === "day")?.value);

  return { year, month, day };
}

function toComparableDayNumber(year: number, month: number, day: number) {
  return year * 10000 + (month + 1) * 100 + day;
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

export function getTomorrowDateStringSv() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Stockholm",
  }).format(tomorrow);
}

export function getMatchesForExactDate(matches: ScheduleMatch[], dateString: string) {
  return sortMatchesByDateTime(
    matches.filter((match) => match.date.toLowerCase() === dateString.toLowerCase())
  );
}

export function getMatchesToday(matches: ScheduleMatch[]) {
  return getMatchesForExactDate(matches, getTodayDateStringSv());
}

export function getMatchesTomorrow(matches: ScheduleMatch[]) {
  return getMatchesForExactDate(matches, getTomorrowDateStringSv());
}

export function getUpcomingMatches(matches: ScheduleMatch[]) {
  const today = getTodayPartsInStockholm();
  const todayNumber = toComparableDayNumber(today.year, today.month, today.day);

  return sortMatchesByDateTime(
    matches.filter((match) => {
      const parsed = parseSwedishDateParts(match.date);
      if (!parsed) return false;

      const matchNumber = toComparableDayNumber(
        parsed.year,
        parsed.month,
        parsed.day
      );

      return matchNumber >= todayNumber;
    })
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