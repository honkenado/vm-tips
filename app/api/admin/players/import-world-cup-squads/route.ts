import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const WIKI_TITLE = "2026_FIFA_World_Cup_squads";

type TeamRow = {
  id: string;
  name: string;
  wikipedia_title: string | null;
};

type ParsedPlayer = {
  name: string;
  position: string;
  club: string | null;
  age: number | null;
  caps: number | null;
  goals: number | null;
  shirtNumber: number | null;
};

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, " ")
      .replace(/<img[^>]*>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractRows(tableHtml: string) {
  return Array.from(tableHtml.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)).map(
    (m) => m[0]
  );
}

function extractCells(rowHtml: string) {
  return Array.from(rowHtml.matchAll(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi)).map(
    (m) => m[0]
  );
}

function extractTables(html: string) {
  return Array.from(html.matchAll(/<table[^>]*>[\s\S]*?<\/table>/gi)).map(
    (m) => m[0]
  );
}

function normalizePosition(value: string) {
  const text = value.toLowerCase();

  if (text.includes("gk") || text.includes("goalkeeper")) return "GK";
  if (text.includes("df") || text.includes("defender")) return "DF";
  if (text.includes("mf") || text.includes("midfielder")) return "MF";
  if (text.includes("fw") || text.includes("forward")) return "FW";

  return "";
}

function parseNumber(value: string): number | null {
  const match = value.replace(/,/g, "").match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

function parseAge(value: string): number | null {
  const match = value.match(/aged\s+(\d{1,2})/i) ?? value.match(/\((\d{1,2})\)/);
  if (!match) return null;

  const age = Number(match[1]);
  return age >= 15 && age <= 50 ? age : null;
}

function parsePlayersFromTable(tableHtml: string): ParsedPlayer[] {
  const rows = extractRows(tableHtml);
  const players: ParsedPlayer[] = [];

  for (const row of rows) {
    const cells = extractCells(row);
    const texts = cells.map(stripTags).filter(Boolean);

    if (texts.length < 5) continue;

    const joined = texts.join(" | ").toLowerCase();
    if (joined.includes("player") && joined.includes("club")) continue;

    const positionIndex = texts.findIndex((text) => normalizePosition(text));
    if (positionIndex === -1) continue;

    const position = normalizePosition(texts[positionIndex]);
    const name = texts[positionIndex + 1]
  ?.replace(/\(\s*(vice-|third |fourth |fifth )?captain\s*\)/gi, "")
  .replace(/\s+/g, " ")
  .trim();

    if (!name || name.length < 2) continue;

    const ageText = texts.find((text) => text.includes("aged")) ?? "";
    const numericTexts = texts.filter((text) => /^-?\d+$/.test(text.trim()));

    const club = texts[texts.length - 1] ?? null;

    players.push({
      name,
      position,
      club,
      age: parseAge(ageText),
      caps: numericTexts.length >= 2 ? parseNumber(numericTexts[numericTexts.length - 2]) : null,
      goals: numericTexts.length >= 1 ? parseNumber(numericTexts[numericTexts.length - 1]) : null,
      shirtNumber: parseNumber(texts[0]),
    });
  }

  const unique = new Map<string, ParsedPlayer>();

  for (const player of players) {
    const key = `${player.name.toLowerCase()}-${player.position}`;
    if (!unique.has(key)) unique.set(key, player);
  }

  return Array.from(unique.values());
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const TEAM_NAME_ALIASES: Record<string, string[]> = {
  Sverige: ["Sweden"],
  Skottland: ["Scotland"],
  Tyskland: ["Germany"],
  Frankrike: ["France"],
  Spanien: ["Spain"],
  Portugal: ["Portugal"],
  England: ["England"],
  Brasilien: ["Brazil"],
  Argentina: ["Argentina"],
  Nederländerna: ["Netherlands"],
  Belgien: ["Belgium"],
  Schweiz: ["Switzerland"],
  Österrike: ["Austria"],
  Norge: ["Norway"],
  Danmark: ["Denmark"],
  Kroatien: ["Croatia"],
  Marocko: ["Morocco"],
  Mexiko: ["Mexico"],
  USA: ["United States"],
  Kanada: ["Canada"],
  Japan: ["Japan"],
  Sydkorea: ["South Korea", "Korea Republic"],
  Australien: ["Australia"],
  "Nya Zeeland": ["New Zealand"],
  Saudiarabien: ["Saudi Arabia"],
  Elfenbenskusten: ["Ivory Coast", "Côte d'Ivoire"],
  "DR Kongo": ["DR Congo", "Congo DR"],
  "Bosnien och Hercegovina": ["Bosnia and Herzegovina"],
  "Kap Verde": ["Cape Verde"],
  Sydafrika: ["South Africa"],
  Egypten: ["Egypt"],
  Algeriet: ["Algeria"],
  Tunisien: ["Tunisia"],
  Ghana: ["Ghana"],
  Senegal: ["Senegal"],
  Iran: ["Iran"],
  Irak: ["Iraq"],
  Jordanien: ["Jordan"],
  Qatar: ["Qatar"],
  Uzbekistan: ["Uzbekistan"],
  Turkiet: ["Turkey"],
  Tjeckien: ["Czech Republic", "Czechia"],
  Colombia: ["Colombia"],
  Ecuador: ["Ecuador"],
  Uruguay: ["Uruguay"],
  Paraguay: ["Paraguay"],
  Panama: ["Panama"],
  Haiti: ["Haiti"],
  Curaçao: ["Curaçao", "Curacao"],
};

function teamAliases(team: TeamRow) {
  const values = [
    team.name,
    ...(TEAM_NAME_ALIASES[team.name] ?? []),
  ];

  if (team.wikipedia_title) {
    values.push(
      team.wikipedia_title
        .replace(/ national football team/gi, "")
        .replace(/_/g, " ")
    );
  }

  return values.map(normalizeName);
}

async function fetchWikiSections() {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", WIKI_TITLE);
  url.searchParams.set("prop", "sections");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { "User-Agent": "AddesVMTips/1.0" },
  });

  if (!res.ok) throw new Error("Kunde inte hämta Wikipedia-sektioner");

  const json = await res.json();
  return json.parse?.sections ?? [];
}

async function fetchSectionHtml(index: string) {
  const url = new URL("https://en.wikipedia.org/w/api.php");

  url.searchParams.set("action", "parse");
  url.searchParams.set("page", WIKI_TITLE);
  url.searchParams.set("section", index);
  url.searchParams.set("prop", "text");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      "User-Agent": "AddesVMTips/1.0",
    },
  });

  const text = await res.text();

  let json: any;

  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `Wikipedia svarade inte med JSON: ${text.slice(0, 120)}`
    );
  }

  if (!res.ok || json.error) {
    throw new Error(
      json.error?.info ?? `Kunde inte hämta Wikipedia-sektion ${index}`
    );
  }

  return json.parse?.text ?? "";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isFinalSquadSection(html: string) {
  const text = stripTags(html).toLowerCase();

  return (
    text.includes("announced their final squad") ||
    text.includes("announced its final squad") ||
    text.includes("their final squad was announced") ||
    text.includes("then reduced to 28 players") ||
    text.includes("then reduced to 26 players")
  );
}

export async function POST() {
  try {
    const supabase = await createClient();

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, wikipedia_title")
      .order("name", { ascending: true });

    if (teamsError) {
      return NextResponse.json({ error: teamsError.message }, { status: 400 });
    }

    const sections = await fetchWikiSections();

    const countrySections = sections.filter((section: any) => {
  const toclevel = Number(section.toclevel);

  return (
    toclevel === 2 &&
    section.index &&
    ![
      "Age",
      "Coaches",
      "Coach representation by country",
    ].includes(section.line)
  );
});

    const results = [];

    const FINAL_SQUAD_TEAMS = [
  "Algeriet",
  "Argentina",
  "Australien",
  "Ecuador",
  "Egypten",
  "Ghana",
  "Iran",
  "Jordanien",
  "Mexiko",
  "Paraguay",
  "Saudiarabien",
  "Senegal",
  "Sydafrika",
  "Tjeckien",
  "Turkiet",
  "Uruguay",
  "Uzbekistan",
];

    for (const team of (teams ?? []) as TeamRow[]) {
  if (!FINAL_SQUAD_TEAMS.includes(team.name)) {
    continue;
  }

  await sleep(5000);

  const aliases = teamAliases(team);

      const section = countrySections.find((s: any) =>
        aliases.includes(normalizeName(s.line))
      );

      if (!section) {
        results.push({
          ok: false,
          team: team.name,
          count: 0,
          error: "Hittade ingen matchande sektion på VM-squad-sidan",
        });
        continue;
      }

      const html = await fetchSectionHtml(section.index);

if (!isFinalSquadSection(html)) {
  results.push({
    ok: false,
    team: team.name,
    count: 0,
    error: "Final squad ej publicerad ännu",
    section: section.line,
  });

  continue;
}

const table = extractTables(html)[0];
const players = table ? parsePlayersFromTable(table) : [];

      if (players.length === 0) {
        results.push({
          ok: false,
          team: team.name,
          count: 0,
          error: "Hittade inga spelare i sektionen",
          section: section.line,
        });
        continue;
      }

      await supabase.from("team_players").delete().eq("team_id", team.id);

      const insertRows = players.map((player) => ({
        team_id: team.id,
        name: player.name,
        position: player.position,
        club: player.club,
        age: player.age,
        caps: player.caps,
        goals: player.goals,
        shirt_number: player.shirtNumber,
        source: "wikipedia-2026-world-cup-squads",
      }));

      const { error: insertError } = await supabase
  .from("team_players")
  .insert(insertRows);

if (insertError) {
  console.log("INSERT ERROR", {
    team: team.name,
    error: insertError,
    sample: insertRows[0],
  });

  results.push({
    ok: false,
    team: team.name,
    count: 0,
    error: insertError.message,
  });

  continue;
}

      results.push({
        ok: true,
        team: team.name,
        section: section.line,
        count: players.length,
      });
    }

    return NextResponse.json({
      ok: true,
      importedPlayers: results.reduce((sum, row) => sum + row.count, 0),
      successCount: results.filter((row) => row.ok).length,
      failCount: results.filter((row) => !row.ok).length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}