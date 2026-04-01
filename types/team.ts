// types/team.ts

export type TeamPlayer = {
  id: string;
  name: string;
  position: "Målvakt" | "Back" | "Mittfältare" | "Anfallare";
  club?: string;
  age?: number;
  caps?: number;
  goals?: number;
  shirtNumber?: number;
};

export type QualificationEntry = {
  id: string;
  label: string;
  opponent?: string;
  result?: string;
  date?: string;
  note?: string;
};

export type TeamProfile = {
  name: string;
  slug: string;
  groupLetter: string;
  fifaRank?: number;
  coach?: string;
  confederation?: string;
  shortDescription?: string;
  qualificationSummary?: string;
  squad: TeamPlayer[];
  qualificationPath: QualificationEntry[];
};