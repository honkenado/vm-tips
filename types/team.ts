export type QualificationEntry = {
  id: string;
  label: string;
  opponent?: string;
  result?: string;
  date?: string;
  note?: string;
  sortOrder?: number;
};

export type TeamPlayer = {
  id: string;
  name: string;
  position: string;
  club?: string;
  age?: number;
  caps?: number;
  goals?: number;
  shirtNumber?: number;
  squadStatus?: string;
  source?: string;
  updatedAt?: string;
};

export type TeamLineupPlayer = {
  id: string;
  name: string;
  shirtNumber: number | null;
};

export type TeamLineupSlot = {
  id: string;
  slotKey: string;
  roleLabel: string;
  xPos: number;
  yPos: number;
  playerId: string | null;
  player: TeamLineupPlayer | null;
};

export type TeamLineup = {
  id: string;
  formation: string;
  lineupName: string;
  slots: TeamLineupSlot[];
};

export type TeamProfile = {
  id: string;
  name: string;
  slug: string;
  groupLetter: string;
  fifaRank?: number;
  coach?: string;
  confederation?: string;
  shortDescription: string;
  qualificationSummary: string;
  squadStatus?: string;
  source?: string;
  updatedAt?: string;
  squad: TeamPlayer[];
  qualificationPath: QualificationEntry[];
  lineup?: TeamLineup | null;
};