// types/team.ts

export type TeamPlayer = {
  id: string;
  name: string;
  position: "Målvakt" | "Back" | "Mittfältare" | "Anfallare" | string;
  club?: string;
  age?: number;
  caps?: number;
  goals?: number;
  shirtNumber?: number;
  squadStatus?: string;
  source?: string;
  updatedAt?: string;
};

export type QualificationEntry = {
  id: string;
  label: string;
  opponent?: string;
  result?: string;
  date?: string;
  note?: string;
  sortOrder?: number;
};

export type TeamProfile = {
  id?: string;
  name: string;
  slug: string;
  groupLetter: string;
  fifaRank?: number;
  coach?: string;
  confederation?: string;
  shortDescription?: string;
  qualificationSummary?: string;
  squadStatus?: string;
  source?: string;
  updatedAt?: string;
  squad: TeamPlayer[];
  qualificationPath: QualificationEntry[];
};