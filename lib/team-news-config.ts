// lib/team-news-config.ts

export type TeamNewsOverride = {
  teamName: string;
  aliases?: string[];
  strongAliases?: string[];
  players?: string[];
  extraExcludeTerms?: string[];
  extraStrongExcludeTerms?: string[];
  hl?: string;
  gl?: string;
  ceid?: string;
};

export const TEAM_NEWS_OVERRIDES: Record<string, TeamNewsOverride> = {
  argentina: {
    teamName: "Argentina",
    aliases: ["Argentina national team", "Argentina football team", "La Albiceleste"],
    strongAliases: ["Argentina national team", "La Albiceleste"],
  },
  australien: {
    teamName: "Australia",
    aliases: ["Australia national team", "Australia football team", "Socceroos"],
    strongAliases: ["Australia national team", "Socceroos"],
  },
  belgien: {
    teamName: "Belgium",
    aliases: ["Belgium national team", "Belgium football team"],
    strongAliases: ["Belgium national team"],
  },
  brasilien: {
    teamName: "Brazil",
    aliases: ["Brazil national team", "Brazil football team", "Seleção", "Selecao"],
    strongAliases: ["Brazil national team", "Seleção", "Selecao"],
  },
  danmark: {
    teamName: "Denmark",
    aliases: ["Denmark national team", "Denmark football team"],
    strongAliases: ["Denmark national team"],
  },
  england: {
    teamName: "England",
    aliases: ["England national team", "England football team", "Three Lions"],
    strongAliases: ["England national team", "Three Lions"],
  },
  frankrike: {
    teamName: "France",
    aliases: ["France national team", "France football team", "Les Bleus"],
    strongAliases: ["France national team", "Les Bleus"],
  },
  italien: {
    teamName: "Italy",
    aliases: ["Italy national team", "Italy football team", "Azzurri"],
    strongAliases: ["Italy national team", "Azzurri"],
  },
  japan: {
    teamName: "Japan",
    aliases: ["Japan national team", "Japan football team"],
    strongAliases: ["Japan national team"],
  },
  kanada: {
    teamName: "Canada",
    aliases: ["Canada national team", "Canada football team"],
    strongAliases: ["Canada national team"],
  },
  kroatien: {
    teamName: "Croatia",
    aliases: ["Croatia national team", "Croatia football team"],
    strongAliases: ["Croatia national team"],
  },
  mexiko: {
    teamName: "Mexico",
    aliases: [
      "Mexico national team",
      "Mexico football team",
      "Mexican national team",
      "El Tri",
      "Selección Mexicana",
      "Seleccion Mexicana",
    ],
    strongAliases: [
      "Mexico national team",
      "Mexican national team",
      "El Tri",
      "Selección Mexicana",
      "Seleccion Mexicana",
    ],
    players: [
      "Santiago Gimenez",
      "Edson Alvarez",
      "Edson Álvarez",
      "Raul Jimenez",
      "Raúl Jiménez",
      "Javier Aguirre",
    ],
    extraExcludeTerms: ["Club America", "Club América", "Chivas", "Tigres", "Monterrey", "Liga MX"],
  },
  marocko: {
    teamName: "Morocco",
    aliases: ["Morocco national team", "Morocco football team"],
    strongAliases: ["Morocco national team"],
  },
  nederländerna: {
    teamName: "Netherlands",
    aliases: ["Netherlands national team", "Netherlands football team", "Holland"],
    strongAliases: ["Netherlands national team", "Holland"],
  },
  nigeria: {
    teamName: "Nigeria",
    aliases: ["Nigeria national team", "Nigeria football team", "Super Eagles"],
    strongAliases: ["Nigeria national team", "Super Eagles"],
  },
  norge: {
    teamName: "Norway",
    aliases: ["Norway national team", "Norway football team"],
    strongAliases: ["Norway national team"],
  },
  polen: {
    teamName: "Poland",
    aliases: ["Poland national team", "Poland football team"],
    strongAliases: ["Poland national team"],
  },
  portugal: {
    teamName: "Portugal",
    aliases: ["Portugal national team", "Portugal football team"],
    strongAliases: ["Portugal national team"],
  },
  saudiarabien: {
    teamName: "Saudi Arabia",
    aliases: ["Saudi Arabia national team", "Saudi Arabia football team"],
    strongAliases: ["Saudi Arabia national team"],
  },
  schweiz: {
    teamName: "Switzerland",
    aliases: ["Switzerland national team", "Switzerland football team"],
    strongAliases: ["Switzerland national team"],
  },
  senegal: {
    teamName: "Senegal",
    aliases: ["Senegal national team", "Senegal football team"],
    strongAliases: ["Senegal national team"],
  },
  serbien: {
    teamName: "Serbia",
    aliases: ["Serbia national team", "Serbia football team"],
    strongAliases: ["Serbia national team"],
  },
  spanien: {
    teamName: "Spain",
    aliases: ["Spain national team", "Spain football team", "La Roja"],
    strongAliases: ["Spain national team", "La Roja"],
  },
  sverige: {
    teamName: "Sweden",
    aliases: ["Sweden national team", "Sweden football team"],
    strongAliases: ["Sweden national team"],
  },
  sydafrika: {
    teamName: "South Africa",
    aliases: ["South Africa national team", "South Africa football team", "Bafana Bafana"],
    strongAliases: ["South Africa national team", "Bafana Bafana"],
  },
  sydkorea: {
    teamName: "South Korea",
    aliases: [
      "South Korea national team",
      "South Korea football team",
      "Korea Republic",
      "Korea Republic national team",
    ],
    strongAliases: ["South Korea national team", "Korea Republic national team"],
  },
  tjeckien: {
    teamName: "Czech Republic",
    aliases: [
      "Czech Republic national team",
      "Czech Republic football team",
      "Czechia national team",
      "Czechia football team",
    ],
    strongAliases: ["Czech Republic national team", "Czechia national team"],
  },
  tunisien: {
    teamName: "Tunisia",
    aliases: ["Tunisia national team", "Tunisia football team"],
    strongAliases: ["Tunisia national team"],
  },
  tyskland: {
    teamName: "Germany",
    aliases: ["Germany national team", "Germany football team", "Die Mannschaft"],
    strongAliases: ["Germany national team", "Die Mannschaft"],
  },
  usa: {
    teamName: "United States",
    aliases: [
      "United States national team",
      "USMNT",
      "USA national team",
      "United States football team",
    ],
    strongAliases: ["United States national team", "USMNT", "USA national team"],
  },
  uruguay: {
    teamName: "Uruguay",
    aliases: ["Uruguay national team", "Uruguay football team"],
    strongAliases: ["Uruguay national team"],
  },
};