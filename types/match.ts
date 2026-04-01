// types/match.ts

export type TournamentStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "bronze"
  | "final";

export type BroadcastChannel =
  | "SVT1"
  | "SVT2"
  | "TV4"
  | "TV6"
  | "Viasat Sport"
  | "Viaplay"
  | "Max"
  | "Discovery+"
  | "Okänd";

export type MatchStatus = "scheduled" | "live" | "finished";

export type TournamentMatch = {
  id: string;
  matchNumber?: number;

  stage: TournamentStage;
  groupLetter?: string;

  homeTeam: string;
  awayTeam: string;

  /**
   * ISO-format i svensk lokal tid, t.ex:
   * 2026-06-14T21:00:00+02:00
   */
  kickoffAt: string;

  venue?: string;
  city?: string;

  tvChannels?: BroadcastChannel[];
  streamingChannels?: string[];

  status?: MatchStatus;

  homeScore?: number | null;
  awayScore?: number | null;

  /**
   * Valfritt för senare bruk:
   * kan kopplas till officiellt resultat / prediction / extern källa
   */
  externalId?: string;
};