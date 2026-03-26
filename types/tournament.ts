export type Match = {
  id: number;
  matchNumber: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: string;
  awayGoals: string;
};

export type TableRow = {
  team: string;
  played: number;
  won: 0 | number;
  drawn: 0 | number;
  lost: 0 | number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  fairPlay: number;
  fifaRank: number;
};

export type GroupData = {
  name: string;
  teams: string[];
  matches: Match[];
};

export type ThirdPlaceRow = TableRow & {
  groupName: string;
  groupLetter: string;
  isQualified?: boolean;
};

export type ViewMode =
  | "all"
  | "groups"
  | "thirds"
  | "knockout"
  | "leaderboard";

export type KnockoutMatch = {
  id: string;
  label: string;
  home: string;
  away: string;
};