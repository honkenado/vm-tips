import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { scorePrediction } from "@/lib/scoring";
import { getGroupStageSchedule } from "@/lib/match-schedule";
import { getUpcomingMatches } from "@/lib/match-utils";
import type { GroupData, Match, KnockoutMatch } from "@/types/tournament";
import { buildNextRound, getKnockoutSeedData } from "@/lib/tournament";

const TOURNAMENT_SLUG = "world-cup-2026";

type KnockoutSelections = Record<string, string>;

type DbPredictionRow = {
  user_id: string;
  group_stage: unknown;
  knockout: unknown;
  golden_boot: string | null;
  golden_boot_corrected: string | null;
  updated_at: string | null;
};

type DbProfileRow = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email?: string | null;
  role: string | null;
  is_admin?: boolean | null;
  payment_status: "paid" | "unpaid" | null;
  created_at: string | null;
};

type LeaderboardEntry = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  payment_status: "paid" | "unpaid" | null;
  has_prediction: boolean;
  updated_at: string | null;
  points: number;
  predicted_group_goals: number;
  official_group_goals: number;
  group_goals_diff: number;
  breakdown: unknown;
  placement: number;
};

type LeagueSummary = {
  id: string;
  name: string;
  rank: number | null;
  total: number;
  note: string;
  href: string;
};

function asGroups(value: unknown): GroupData[] {
  return Array.isArray(value) ? (value as GroupData[]) : [];
}

function asKnockout(value: unknown): KnockoutSelections {
  return value && typeof value === "object" ? (value as KnockoutSelections) : {};
}

function displayName(entry: {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
}) {
  return (
    [entry.first_name, entry.last_name].filter(Boolean).join(" ").trim() ||
    entry.username ||
    entry.email ||
    "Deltagare"
  );
}

function getTotalGroupGoals(groups: GroupData[]): number {
  let total = 0;

  for (const group of groups) {
    if (!Array.isArray(group.matches)) continue;

    for (const match of group.matches) {
      const homeGoals =
        match.homeGoals !== "" && match.homeGoals != null ? Number(match.homeGoals) : null;
      const awayGoals =
        match.awayGoals !== "" && match.awayGoals != null ? Number(match.awayGoals) : null;

      if (
        homeGoals !== null &&
        awayGoals !== null &&
        !Number.isNaN(homeGoals) &&
        !Number.isNaN(awayGoals)
      ) {
        total += homeGoals + awayGoals;
      }
    }
  }

  return total;
}

function findGroupMatch(groups: GroupData[], matchNumber: number): Match | null {
  for (const group of groups) {
    const match = group.matches?.find((item) => item.matchNumber === matchNumber);
    if (match) return match;
  }

  return null;
}

function hasScore(match: Match | null | undefined) {
  if (!match) return false;
  return match.homeGoals !== "" && match.awayGoals !== "";
}

function toNumberScore(value: string | null | undefined) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function outcome(homeGoals: number, awayGoals: number) {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
}

function pointsForMatch(prediction: Match | null, result: Match | null) {
  if (!prediction || !result || !hasScore(prediction) || !hasScore(result)) return 0;

  const predictedHome = toNumberScore(prediction.homeGoals);
  const predictedAway = toNumberScore(prediction.awayGoals);
  const resultHome = toNumberScore(result.homeGoals);
  const resultAway = toNumberScore(result.awayGoals);

  if (
    predictedHome === null ||
    predictedAway === null ||
    resultHome === null ||
    resultAway === null
  ) {
    return 0;
  }

  if (predictedHome === resultHome && predictedAway === resultAway) return 4;

  return outcome(predictedHome, predictedAway) === outcome(resultHome, resultAway) ? 3 : 0;
}

function pointsLabel(points: number) {
  if (points === 4) return "Exakt resultat";
  if (points === 3) return "Rätt vinnare";
  if (points > 0) return "Poäng";
  return "Inga poäng";
}

function buildLeaderboard({
  profiles,
  predictions,
  officialGroupStage,
  officialKnockout,
  officialGoldenBoot,
}: {
  profiles: DbProfileRow[];
  predictions: DbPredictionRow[];
  officialGroupStage: GroupData[];
  officialKnockout: KnockoutSelections;
  officialGoldenBoot: string;
}): LeaderboardEntry[] {
  const officialGroupGoals = getTotalGroupGoals(officialGroupStage);

  const predictionMap = new Map<string, DbPredictionRow>(
    predictions.map((prediction) => [prediction.user_id, prediction])
  );

  const leaderboard = profiles
    .map((profile) => {
      const prediction = predictionMap.get(profile.id);
      const hasPrediction = Boolean(prediction);
      const isPaid = profile.payment_status === "paid";

      const predictedGroupStage = asGroups(prediction?.group_stage);
      const predictedKnockout = asKnockout(prediction?.knockout);
      const predictedGoldenBoot =
        prediction?.golden_boot_corrected?.trim() || prediction?.golden_boot?.trim() || "";

      const rawBreakdown =
        hasPrediction && isPaid
          ? scorePrediction(
              predictedGroupStage,
              predictedKnockout,
              officialGroupStage,
              officialKnockout,
              predictedGoldenBoot,
              officialGoldenBoot
            )
          : null;

      const predictedGroupGoals =
        hasPrediction && isPaid ? getTotalGroupGoals(predictedGroupStage) : 0;

      const groupGoalsDiff =
        hasPrediction && isPaid
          ? Math.abs(predictedGroupGoals - officialGroupGoals)
          : Number.MAX_SAFE_INTEGER;

      return {
        id: profile.id,
        username: profile.username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        payment_status: profile.payment_status,
        has_prediction: isPaid ? hasPrediction : false,
        updated_at: isPaid ? prediction?.updated_at ?? null : null,
        points: isPaid ? rawBreakdown?.total ?? 0 : 0,
        predicted_group_goals: predictedGroupGoals,
        official_group_goals: officialGroupGoals,
        group_goals_diff: groupGoalsDiff,
        breakdown: isPaid ? rawBreakdown : null,
        placement: 0,
      };
    })
    .filter((entry) => entry.payment_status === "paid");

  leaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.group_goals_diff !== b.group_goals_diff) {
      return a.group_goals_diff - b.group_goals_diff;
    }
    if (a.has_prediction && !b.has_prediction) return -1;
    if (!a.has_prediction && b.has_prediction) return 1;

    return displayName(a).localeCompare(displayName(b), "sv");
  });

  return leaderboard.map((entry, index) => ({ ...entry, placement: index + 1 }));
}

function buildNextMatchStats({
  matchNumber,
  predictions,
  currentUserId,
}: {
  matchNumber: number;
  predictions: DbPredictionRow[];
  currentUserId: string;
}) {
  const scoredPredictions = predictions
    .map((prediction) => {
      const predictedMatch = findGroupMatch(asGroups(prediction.group_stage), matchNumber);
      const homeGoals = toNumberScore(predictedMatch?.homeGoals);
      const awayGoals = toNumberScore(predictedMatch?.awayGoals);

      if (homeGoals === null || awayGoals === null) return null;

      return {
        userId: prediction.user_id,
        homeGoals,
        awayGoals,
        resultLabel: `${homeGoals}–${awayGoals}`,
        outcome: outcome(homeGoals, awayGoals),
      };
    })
    .filter(Boolean) as Array<{
    userId: string;
    homeGoals: number;
    awayGoals: number;
    resultLabel: string;
    outcome: "home" | "draw" | "away";
  }>;

  const total = scoredPredictions.length;
  const currentUserPrediction = scoredPredictions.find((item) => item.userId === currentUserId);

  const resultCounts = new Map<string, number>();
  const outcomeCounts = {
    home: 0,
    draw: 0,
    away: 0,
  };

  for (const item of scoredPredictions) {
    resultCounts.set(item.resultLabel, (resultCounts.get(item.resultLabel) ?? 0) + 1);
    outcomeCounts[item.outcome] += 1;
  }

  const popularResult = Array.from(resultCounts.entries())
    .map(([label, count]) => ({
      label,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "sv"))[0] ?? null;

  const sameTipCount = currentUserPrediction
    ? resultCounts.get(currentUserPrediction.resultLabel) ?? 0
    : 0;

  return {
    userTip: currentUserPrediction?.resultLabel ?? null,
    peopleTip: popularResult?.label ?? null,
    sameTipPercent: total > 0 && currentUserPrediction ? Math.round((sameTipCount / total) * 100) : null,
    outcomeDistribution: {
      home: total > 0 ? Math.round((outcomeCounts.home / total) * 100) : 0,
      draw: total > 0 ? Math.round((outcomeCounts.draw / total) * 100) : 0,
      away: total > 0 ? Math.round((outcomeCounts.away / total) * 100) : 0,
    },
  };
}

async function getRankSnapshots(
  serviceSupabase: any,
  userId: string
) {
  try {
    const { data, error } = await serviceSupabase
      .from("user_rank_snapshots")
      .select("snapshot_date, rank, points")
      .eq("user_id", userId)
      .order("snapshot_date", { ascending: true })
      .limit(60);

    if (error || !data) return [];

    return (data as any[]).map((row) => ({
  date: new Date(String(row.snapshot_date)).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
  }),
  rank: Number(row.rank),
  points: Number(row.points ?? 0),
}));
  } catch {
    return [];
  }
}

function knockoutMatchId(matchNumber: number) {
  return `m${matchNumber}`;
}

function getKnockoutLoser(match: KnockoutMatch, winners: KnockoutSelections) {
  const winner = winners[match.id];

  if (!winner) return "";
  if (winner === match.home) return match.away;
  if (winner === match.away) return match.home;

  return "";
}

function buildOfficialKnockoutMatchMap(
  groups: GroupData[],
  winners: KnockoutSelections
) {
  const { round32 } = getKnockoutSeedData(groups);

  const round16 = buildNextRound(round32, winners, "r16", "Åttondelsfinal").map(
    (match, index) => ({
      ...match,
      id: `m${89 + index}`,
    })
  );

  const quarterfinals = buildNextRound(
    round16,
    winners,
    "qf",
    "Kvartsfinal"
  ).map((match, index) => ({
    ...match,
    id: `m${97 + index}`,
  }));

  const semifinals = buildNextRound(
    quarterfinals,
    winners,
    "sf",
    "Semifinal"
  ).map((match, index) => ({
    ...match,
    id: `m${101 + index}`,
  }));

  const final = buildNextRound(semifinals, winners, "final", "Final").map(
    (match) => ({
      ...match,
      id: "m104",
    })
  );

  const bronze =
    semifinals.length === 2
      ? [
          {
            id: "m103",
            label: "Bronsmatch",
            home: getKnockoutLoser(semifinals[0], winners),
            away: getKnockoutLoser(semifinals[1], winners),
          },
        ]
      : [];

  const allMatches = [
    ...round32,
    ...round16,
    ...quarterfinals,
    ...semifinals,
    ...bronze,
    ...final,
  ];

  return new Map(
    allMatches.map((match) => [
      Number(match.id.replace("m", "")),
      match,
    ])
  );
}

function getKnockoutRoundPoints(matchNumber: number) {
  if (matchNumber >= 73 && matchNumber <= 88) return { from: 73, to: 88, points: 2 };
  if (matchNumber >= 89 && matchNumber <= 96) return { from: 89, to: 96, points: 3 };
  if (matchNumber >= 97 && matchNumber <= 100) return { from: 97, to: 100, points: 4 };
  if (matchNumber >= 101 && matchNumber <= 102) return { from: 101, to: 102, points: 7 };
  if (matchNumber === 103) return { from: 103, to: 103, points: 5 };

  return null;
}

function pointsForKnockoutMatch(
  matchNumber: number,
  predictionKnockout: KnockoutSelections,
  officialKnockout: KnockoutSelections
) {
  const officialWinner = officialKnockout[knockoutMatchId(matchNumber)];
  const round = getKnockoutRoundPoints(matchNumber);

  if (!officialWinner || !round) return 0;

  for (let number = round.from; number <= round.to; number += 1) {
    if (predictionKnockout[knockoutMatchId(number)] === officialWinner) {
      return round.points;
    }
  }

  return 0;
}

export async function GET(request: NextRequest) {
  const authSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const { data: tournament, error: tournamentError } = await serviceSupabase
    .from("tournaments")
    .select("id")
    .eq("slug", TOURNAMENT_SLUG)
    .single();

  if (tournamentError || !tournament) {
    return NextResponse.json({ error: "Kunde inte hitta turneringen" }, { status: 404 });
  }

  const profileColumns =
    "id, username, first_name, last_name, email, role, is_admin, payment_status, created_at";

  const [
  { data: profiles, error: profilesError },
  { data: predictions, error: predictionsError },
  { data: resultsRow, error: resultsError },
  { data: currentProfile },
  { data: activeBet },
] = await Promise.all([
    serviceSupabase.from("profiles").select(profileColumns).order("created_at", { ascending: true }),
    serviceSupabase
      .from("predictions")
      .select("user_id, group_stage, knockout, golden_boot, golden_boot_corrected, updated_at")
      .eq("tournament_id", tournament.id),
    serviceSupabase
      .from("tournament_results")
      .select("group_stage, knockout, golden_boot")
      .eq("tournament_id", tournament.id)
      .maybeSingle(),
    serviceSupabase.from("profiles").select(profileColumns).eq("id", user.id).maybeSingle(),
    serviceSupabase
  .from("match_bets")
  .select("match_number, market, selection, odds, comment, created_at")
  .eq("is_active", true)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle(),
  ]);

  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 });
  if (predictionsError) return NextResponse.json({ error: predictionsError.message }, { status: 500 });
  if (resultsError) return NextResponse.json({ error: resultsError.message }, { status: 500 });

  const predictionRows = (predictions ?? []) as DbPredictionRow[];
  const officialGroupStage = asGroups(resultsRow?.group_stage);
  const officialKnockout = asKnockout(resultsRow?.knockout);
  const officialGoldenBoot = typeof resultsRow?.golden_boot === "string" ? resultsRow.golden_boot : "";
  const officialKnockoutMatchMap = buildOfficialKnockoutMatchMap(
  officialGroupStage,
  officialKnockout
);

function isScheduleMatchCompleted(match: { stage: string; matchNumber: number }) {
  if (match.stage === "group") {
    const resultMatch = findGroupMatch(officialGroupStage, match.matchNumber);
    return hasScore(resultMatch);
  }

  return Boolean(officialKnockout[knockoutMatchId(match.matchNumber)]);
}

function getDisplayTeams(match: {
  stage: string;
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
}) {
  if (match.stage !== "knockout") {
    return {
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
    };
  }

  const officialMatch = officialKnockoutMatchMap.get(match.matchNumber);

  return {
    homeTeam: officialMatch?.home || match.homeTeam,
    awayTeam: officialMatch?.away || match.awayTeam,
  };
}

  const leaderboard = buildLeaderboard({
    profiles: (profiles ?? []) as DbProfileRow[],
    predictions: predictionRows,
    officialGroupStage,
    officialKnockout,
    officialGoldenBoot,
  });

  const currentEntry = leaderboard.find((entry) => entry.id === user.id) ?? null;
  const leaderEntry = leaderboard[0] ?? null;
  const top10Entry = leaderboard[9] ?? null;
  const previousEntry = currentEntry ? leaderboard[currentEntry.placement - 2] ?? null : null;

  const userPrediction = predictionRows.find((prediction) => prediction.user_id === user.id) ?? null;
  const userGroups = asGroups(userPrediction?.group_stage);

  const completedResultMatches = officialGroupStage
    .flatMap((group) => group.matches ?? [])
    .filter((match) => hasScore(match))
    .sort((a, b) => b.matchNumber - a.matchNumber);

  const latestPoints = completedResultMatches
    .map((resultMatch) => {
      const predictedMatch = findGroupMatch(userGroups, resultMatch.matchNumber);
      const points = pointsForMatch(predictedMatch, resultMatch);

      if (points <= 0) return null;

      return {
        match: `${resultMatch.homeTeam} ${resultMatch.homeGoals}–${resultMatch.awayGoals} ${resultMatch.awayTeam}`,
        prediction: predictedMatch
          ? `${predictedMatch.homeGoals || "-"}–${predictedMatch.awayGoals || "-"}`
          : "-",
        points,
        note: pointsLabel(points),
      };
    })
    .filter(Boolean)
    .slice(0, 5);

  const schedule = getGroupStageSchedule();

const firstUnplayedMatch =
  schedule.find((match) => !isScheduleMatchCompleted(match)) ?? null;

const firstUnplayedIndex = firstUnplayedMatch
  ? schedule.findIndex((match) => match.matchNumber === firstUnplayedMatch.matchNumber)
  : -1;

const upcoming24HourMatches =
  firstUnplayedIndex >= 0
    ? schedule
        .slice(firstUnplayedIndex)
        .filter((match) => {
          return !isScheduleMatchCompleted(match);
        })
        .slice(0, 4)
    : [];

const completedPreviousMatches =
  firstUnplayedIndex > 0
    ? schedule
        .slice(Math.max(0, firstUnplayedIndex - 2), firstUnplayedIndex)
        .filter((match) => {
          return isScheduleMatchCompleted(match);
        })
    : [];

const todayMatches = [...completedPreviousMatches, ...upcoming24HourMatches];



const firstUnplayedToday =
  todayMatches.find((match) => {
    return !isScheduleMatchCompleted(match);
  }) ?? todayMatches[0] ?? null;

const nextMatch = firstUnplayedToday ?? firstUnplayedMatch ?? schedule[0] ?? null;

  const nextMatchStats = nextMatch?.stage === "group"
    ? buildNextMatchStats({
        matchNumber: nextMatch.matchNumber,
        predictions: predictionRows,
        currentUserId: user.id,
      })
    : null;

 const todayMatchCards = todayMatches.map((match) => {
  const displayTeams = getDisplayTeams(match);
  const userKnockout = asKnockout(userPrediction?.knockout);

  const stats =
    match.stage === "group"
      ? buildNextMatchStats({
          matchNumber: match.matchNumber,
          predictions: predictionRows,
          currentUserId: user.id,
        })
      : null;

  const resultMatch = findGroupMatch(officialGroupStage, match.matchNumber);
  const predictedMatch = findGroupMatch(userGroups, match.matchNumber);

  const isCompleted = isScheduleMatchCompleted(match);

  const userPoints = isCompleted
    ? match.stage === "group"
      ? pointsForMatch(predictedMatch, resultMatch)
      : pointsForKnockoutMatch(
          match.matchNumber,
          userKnockout,
          officialKnockout
        )
    : null;

  return {
    matchNumber: match.matchNumber,
    homeTeam: displayTeams.homeTeam,
    awayTeam: displayTeams.awayTeam,
    date: match.date,
    time: match.time,
    groupName: match.groupName,
    tvChannel: match.tvChannel ?? null,
    userTip: stats?.userTip ?? null,
    peopleTip: stats?.peopleTip ?? null,
    sameTipPercent: stats?.sameTipPercent ?? null,
    outcomeDistribution: stats?.outcomeDistribution ?? null,
    isCompleted,
    result: isCompleted
      ? resultMatch
        ? `${resultMatch.homeGoals}–${resultMatch.awayGoals}`
        : null
      : null,
    userPoints,
    isOpen: match.matchNumber === firstUnplayedToday?.matchNumber,
  };
});

  const leagueSummaries: LeagueSummary[] = [];

  if (currentEntry) {
    leagueSummaries.push({
      id: "main",
      name: "Globala ligan",
      rank: currentEntry.placement,
      total: leaderboard.length,
      note: previousEntry
        ? `${Math.max(0, previousEntry.points - currentEntry.points)}p till plats ${previousEntry.placement}`
        : "Du leder",
      href: "/league",
    });
  }

  const { data: memberRows } = await serviceSupabase
    .from("league_members")
    .select("league_id")
    .eq("user_id", user.id);

  const leagueIds = Array.from(new Set((memberRows ?? []).map((row) => row.league_id).filter(Boolean)));

  if (leagueIds.length > 0) {
    const { data: leagues } = await serviceSupabase
      .from("leagues")
      .select("id, name, created_at")
      .in("id", leagueIds)
      .order("created_at", { ascending: false });

    for (const league of (leagues ?? []).slice(0, 2)) {
      const { data: leagueMembers } = await serviceSupabase
        .from("league_members")
        .select("user_id")
        .eq("league_id", league.id);

      const memberIds = new Set((leagueMembers ?? []).map((row) => row.user_id));
      const leagueBoard = leaderboard.filter((entry) => memberIds.has(entry.id));
      const rank = leagueBoard.findIndex((entry) => entry.id === user.id) + 1;
      const above = rank > 1 ? leagueBoard[rank - 2] : null;

      leagueSummaries.push({
        id: league.id,
        name: league.name,
        rank: rank > 0 ? rank : null,
        total: leagueBoard.length,
        note: above && currentEntry
          ? `${Math.max(0, above.points - currentEntry.points)}p till ledaren`
          : "Du leder",
        href: `/league/${league.id}`,
      });
    }
  }

  const rankSnapshots = await getRankSnapshots(serviceSupabase, user.id);
  const rankHistory = rankSnapshots.length > 0
    ? rankSnapshots
    : currentEntry
      ? [
          {
            date: "Idag",
            rank: currentEntry.placement,
            points: currentEntry.points,
          },
        ]
      : [];
      const matchBet = activeBet
  ? {
      matchNumber: Number(activeBet.match_number),
      market: activeBet.market,
      selection: activeBet.selection,
      odds: Number(activeBet.odds),
      comment: activeBet.comment,
    }
  : null;

  const nextMatchDisplayTeams = nextMatch ? getDisplayTeams(nextMatch) : null;

  return NextResponse.json({
    user: {
      id: user.id,
      displayName: displayName((currentProfile ?? {}) as DbProfileRow),
      isLoggedIn: true,
      isAdmin: currentProfile?.role === "admin" || currentProfile?.is_admin === true,
    },
    hero: {
      totalPoints: currentEntry?.points ?? 0,
      totalParticipants: leaderboard.length,
      leaderPoints: leaderEntry?.points ?? 0,
      pointsToLeader: currentEntry && leaderEntry ? Math.max(0, leaderEntry.points - currentEntry.points) : null,
      pointsToTop10: currentEntry && top10Entry ? Math.max(0, top10Entry.points - currentEntry.points) : null,
      chosenGoldenBoot:
        userPrediction?.golden_boot_corrected?.trim() || userPrediction?.golden_boot?.trim() || "Ej valt",
      latestUpdate: latestPoints[0] ?? null,
      leagueSummaries,
    },
    rankHistory,
    latestPoints,
    todayMatches: todayMatchCards,
    nextMatch: nextMatch
      ? {
          matchNumber: nextMatch.matchNumber,
          homeTeam: nextMatchDisplayTeams?.homeTeam ?? nextMatch.homeTeam,
awayTeam: nextMatchDisplayTeams?.awayTeam ?? nextMatch.awayTeam,
          date: nextMatch.date,
          time: nextMatch.time,
          groupName: nextMatch.groupName,
          tvChannel: nextMatch.tvChannel ?? null,
          userTip: nextMatchStats?.userTip ?? null,
          peopleTip: nextMatchStats?.peopleTip ?? null,
          sameTipPercent: nextMatchStats?.sameTipPercent ?? null,
          outcomeDistribution: nextMatchStats?.outcomeDistribution ?? null,
        }
      : null,
      matchBet,
  });
}
