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
    aliases: [
      "Argentina national team",
      "Argentina football team",
      "La Albiceleste",
    ],
    strongAliases: ["Argentina national team", "La Albiceleste"],
    players: [
      "Lionel Messi",
      "Julián Álvarez",
      "Julian Alvarez",
      "Lautaro Martínez",
      "Lautaro Martinez",
      "Enzo Fernández",
      "Enzo Fernandez",
    ],
  },

  australien: {
    teamName: "Australia",
    aliases: [
      "Australia national team",
      "Australia football team",
      "Socceroos",
    ],
    strongAliases: ["Australia national team", "Socceroos"],
    players: [
      "Mathew Ryan",
      "Jackson Irvine",
      "Harry Souttar",
      "Craig Goodwin",
    ],
  },

  belgien: {
    teamName: "Belgium",
    aliases: ["Belgium national team", "Belgium football team"],
    strongAliases: ["Belgium national team"],
    players: [
      "Kevin De Bruyne",
      "Romelu Lukaku",
      "Jérémy Doku",
      "Jeremy Doku",
      "Amadou Onana",
    ],
  },

  brasilien: {
    teamName: "Brazil",
    aliases: [
      "Brazil national team",
      "Brazil football team",
      "Seleção",
      "Selecao",
    ],
    strongAliases: ["Brazil national team", "Seleção", "Selecao"],
    players: [
      "Vinicius Junior",
      "Vinícius Júnior",
      "Rodrygo",
      "Marquinhos",
      "Alisson Becker",
      "Endrick",
    ],
  },

  danmark: {
    teamName: "Denmark",
    aliases: ["Denmark national team", "Denmark football team"],
    strongAliases: ["Denmark national team"],
    players: [
      "Christian Eriksen",
      "Rasmus Højlund",
      "Rasmus Hojlund",
      "Pierre-Emile Højbjerg",
      "Pierre-Emile Hojbjerg",
    ],
  },

  england: {
    teamName: "England",
    aliases: [
      "England national team",
      "England football team",
      "Three Lions",
    ],
    strongAliases: ["England national team", "Three Lions"],
    players: [
      "Harry Kane",
      "Jude Bellingham",
      "Bukayo Saka",
      "Phil Foden",
      "Declan Rice",
    ],
  },

  frankrike: {
    teamName: "France",
    aliases: [
      "France national team",
      "France football team",
      "Les Bleus",
    ],
    strongAliases: ["France national team", "Les Bleus"],
    players: [
      "Kylian Mbappé",
      "Kylian Mbappe",
      "Antoine Griezmann",
      "Aurélien Tchouaméni",
      "Aurelien Tchouameni",
      "William Saliba",
    ],
  },

  italien: {
    teamName: "Italy",
    aliases: ["Italy national team", "Italy football team", "Azzurri"],
    strongAliases: ["Italy national team", "Azzurri"],
    players: [
      "Gianluigi Donnarumma",
      "Federico Chiesa",
      "Nicolò Barella",
      "Nicolo Barella",
      "Giacomo Raspadori",
    ],
  },

  japan: {
    teamName: "Japan",
    aliases: [
      "Japan national team",
      "Japan football team",
      "Samurai Blue",
    ],
    strongAliases: ["Japan national team", "Samurai Blue"],
    players: [
      "Kaoru Mitoma",
      "Takefusa Kubo",
      "Wataru Endo",
      "Daichi Kamada",
      "Takumi Minamino",
    ],
    extraExcludeTerms: [
      "baseball",
      "technology",
      "economy",
      "travel",
      "tourism",
      "anime",
    ],
  },

  kanada: {
    teamName: "Canada",
    aliases: [
      "Canada national team",
      "Canada football team",
      "CanMNT",
    ],
    strongAliases: ["Canada national team", "CanMNT"],
    players: [
      "Alphonso Davies",
      "Jonathan David",
      "Stephen Eustáquio",
      "Stephen Eustaquio",
      "Cyle Larin",
    ],
    extraExcludeTerms: [
      "hockey",
      "election",
      "economy",
      "travel",
      "tourism",
    ],
  },

  kroatien: {
    teamName: "Croatia",
    aliases: ["Croatia national team", "Croatia football team"],
    strongAliases: ["Croatia national team"],
    players: [
      "Luka Modrić",
      "Luka Modric",
      "Joško Gvardiol",
      "Josko Gvardiol",
      "Marcelo Brozović",
      "Marcelo Brozovic",
    ],
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
      "Santiago Giménez",
      "Edson Alvarez",
      "Edson Álvarez",
      "Raul Jimenez",
      "Raúl Jiménez",
      "Javier Aguirre",
    ],
    extraExcludeTerms: [
      "Club America",
      "Club América",
      "Chivas",
      "Tigres",
      "Monterrey",
      "Liga MX",
      "cartel",
      "tourism",
      "travel",
    ],
  },

  marocko: {
    teamName: "Morocco",
    aliases: [
      "Morocco national team",
      "Morocco football team",
      "Atlas Lions",
    ],
    strongAliases: ["Morocco national team", "Atlas Lions"],
    players: [
      "Achraf Hakimi",
      "Hakim Ziyech",
      "Youssef En-Nesyri",
      "Sofyan Amrabat",
      "Brahim Diaz",
    ],
    extraExcludeTerms: [
      "travel",
      "tourism",
      "migration",
      "economy",
      "diplomacy",
    ],
  },

  nederländerna: {
    teamName: "Netherlands",
    aliases: [
      "Netherlands national team",
      "Netherlands football team",
      "Holland",
    ],
    strongAliases: ["Netherlands national team", "Holland"],
    players: [
      "Virgil van Dijk",
      "Frenkie de Jong",
      "Cody Gakpo",
      "Xavi Simons",
      "Memphis Depay",
    ],
  },

  nigeria: {
    teamName: "Nigeria",
    aliases: [
      "Nigeria national team",
      "Nigeria football team",
      "Super Eagles",
    ],
    strongAliases: ["Nigeria national team", "Super Eagles"],
    players: [
      "Victor Osimhen",
      "Ademola Lookman",
      "Alex Iwobi",
      "Wilfred Ndidi",
      "Samuel Chukwueze",
    ],
    extraExcludeTerms: [
      "election",
      "security",
      "economy",
      "oil",
      "travel",
      "tourism",
    ],
  },

  norge: {
    teamName: "Norway",
    aliases: ["Norway national team", "Norway football team"],
    strongAliases: ["Norway national team"],
    players: [
      "Erling Haaland",
      "Martin Ødegaard",
      "Martin Odegaard",
      "Alexander Sørloth",
      "Alexander Sorloth",
    ],
  },

  polen: {
    teamName: "Poland",
    aliases: ["Poland national team", "Poland football team"],
    strongAliases: ["Poland national team"],
    players: [
      "Robert Lewandowski",
      "Piotr Zieliński",
      "Piotr Zielinski",
      "Wojciech Szczęsny",
      "Wojciech Szczesny",
    ],
  },

  portugal: {
    teamName: "Portugal",
    aliases: ["Portugal national team", "Portugal football team"],
    strongAliases: ["Portugal national team"],
    players: [
      "Cristiano Ronaldo",
      "Bruno Fernandes",
      "Bernardo Silva",
      "Rafael Leão",
      "Rafael Leao",
      "João Félix",
      "Joao Felix",
    ],
    extraExcludeTerms: ["tourism", "travel", "economy"],
  },

  saudiarabien: {
    teamName: "Saudi Arabia",
    aliases: [
      "Saudi Arabia national team",
      "Saudi Arabia football team",
      "Green Falcons",
    ],
    strongAliases: ["Saudi Arabia national team", "Green Falcons"],
    players: [
      "Salem Al-Dawsari",
      "Firas Al-Buraikan",
      "Mohammed Al-Owais",
      "Saud Abdulhamid",
    ],
    extraExcludeTerms: [
      "oil",
      "tourism",
      "visa",
      "travel",
      "economy",
      "defense",
      "defence",
      "diplomacy",
    ],
  },

  schweiz: {
    teamName: "Switzerland",
    aliases: ["Switzerland national team", "Switzerland football team"],
    strongAliases: ["Switzerland national team"],
    players: [
      "Granit Xhaka",
      "Manuel Akanji",
      "Xherdan Shaqiri",
      "Breel Embolo",
    ],
    extraExcludeTerms: ["banks", "banking", "economy", "diplomacy"],
  },

  senegal: {
    teamName: "Senegal",
    aliases: ["Senegal national team", "Senegal football team"],
    strongAliases: ["Senegal national team"],
    players: [
      "Sadio Mane",
      "Kalidou Koulibaly",
      "Nicolas Jackson",
      "Ismaila Sarr",
    ],
    extraExcludeTerms: ["election", "security", "economy", "travel"],
  },

  serbien: {
    teamName: "Serbia",
    aliases: ["Serbia national team", "Serbia football team"],
    strongAliases: ["Serbia national team"],
    players: [
      "Dušan Vlahović",
      "Dusan Vlahovic",
      "Aleksandar Mitrović",
      "Aleksandar Mitrovic",
      "Sergej Milinković-Savić",
      "Sergej Milinkovic-Savic",
    ],
  },

  spanien: {
    teamName: "Spain",
    aliases: ["Spain national team", "Spain football team", "La Roja"],
    strongAliases: ["Spain national team", "La Roja"],
    players: [
      "Rodri",
      "Pedri",
      "Lamine Yamal",
      "Álvaro Morata",
      "Alvaro Morata",
      "Nico Williams",
    ],
  },

  sverige: {
    teamName: "Sweden",
    aliases: ["Sweden national team", "Sweden football team"],
    strongAliases: ["Sweden national team"],
    players: [
      "Alexander Isak",
      "Viktor Gyökeres",
      "Viktor Gyokeres",
      "Dejan Kulusevski",
      "Emil Forsberg",
    ],
  },

  sydafrika: {
    teamName: "South Africa",
    aliases: [
      "South Africa national team",
      "South Africa football team",
      "Bafana Bafana",
    ],
    strongAliases: ["South Africa national team", "Bafana Bafana"],
    players: [
      "Percy Tau",
      "Teboho Mokoena",
      "Ronwen Williams",
    ],
    extraExcludeTerms: [
      "election",
      "economy",
      "crime",
      "travel",
      "tourism",
    ],
  },

  sydkorea: {
    teamName: "South Korea",
    aliases: [
      "South Korea national team",
      "South Korea football team",
      "Korea Republic",
      "Korea Republic national team",
      "Taeguk Warriors",
    ],
    strongAliases: [
      "South Korea national team",
      "Korea Republic national team",
      "Taeguk Warriors",
    ],
    players: [
      "Son Heung-min",
      "Heung-min Son",
      "Hwang Hee-chan",
      "Lee Kang-in",
      "Kim Min-jae",
    ],
    extraExcludeTerms: [
      "travel",
      "tourism",
      "visa",
      "daily life",
      "easter",
      "macron",
      "trade",
      "defense",
      "defence",
      "cyber",
      "malware",
    ],
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
    players: [
      "Patrik Schick",
      "Tomáš Souček",
      "Tomas Soucek",
      "Vladimír Coufal",
      "Vladimir Coufal",
    ],
  },

  tunisien: {
    teamName: "Tunisia",
    aliases: ["Tunisia national team", "Tunisia football team"],
    strongAliases: ["Tunisia national team"],
    players: [
      "Youssef Msakni",
      "Ellyes Skhiri",
      "Montassar Talbi",
    ],
  },

  tyskland: {
    teamName: "Germany",
    aliases: [
      "Germany national team",
      "Germany football team",
      "Die Mannschaft",
    ],
    strongAliases: ["Germany national team", "Die Mannschaft"],
    players: [
      "Jamal Musiala",
      "Florian Wirtz",
      "Ilkay Gündogan",
      "Ilkay Gundogan",
      "Kai Havertz",
      "Antonio Rudiger",
    ],
  },

  usa: {
    teamName: "United States",
    aliases: [
      "United States national team",
      "USMNT",
      "USA national team",
      "United States football team",
    ],
    strongAliases: [
      "United States national team",
      "USMNT",
      "USA national team",
    ],
    players: [
      "Christian Pulisic",
      "Weston McKennie",
      "Tyler Adams",
      "Gio Reyna",
      "Folarin Balogun",
    ],
    extraExcludeTerms: [
      "president",
      "congress",
      "senate",
      "election",
      "stocks",
      "economy",
    ],
  },

  uruguay: {
    teamName: "Uruguay",
    aliases: ["Uruguay national team", "Uruguay football team"],
    strongAliases: ["Uruguay national team"],
    players: [
      "Federico Valverde",
      "Darwin Núñez",
      "Darwin Nunez",
      "Ronald Araújo",
      "Ronald Araujo",
    ],
  },
};