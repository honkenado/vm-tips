import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      .replace(/<span[^>]*class="[^"]*flagicon[^"]*"[^>]*>[\s\S]*?<\/span>/gi, " ")
      .replace(/<img[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractWikiLinks(html: string) {
  const matches = Array.from(
    html.matchAll(/<a[^>]*title="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)
  );

  return matches
    .map((match) => stripTags(match[2]))
    .filter(Boolean)
    .filter(
      (text) =>
        !/^\d+$/.test(text) &&
        !/^(club|caps|goals|pos|player|name|age)$/i.test(text)
    );
}

function removeCaptainAndNotes(name: string) {
  return name
    .replace(/\(captain\)/gi, "")
    .replace(/\(vice-captain\)/gi, "")
    .replace(/\(vc\)/gi, "")
    .replace(/\(c\)/gi, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePosition(value: string) {
  const text = value.toLowerCase().trim();

  if (
    text === "gk" ||
    text.includes("goalkeeper") ||
    text.includes("keeper")
  ) {
    return "GK";
  }

  if (
    text === "df" ||
    text.includes("defender") ||
    text.includes("centre-back") ||
    text.includes("center-back") ||
    text.includes("back")
  ) {
    return "DF";
  }

  if (
    text === "mf" ||
    text.includes("midfielder") ||
    text.includes("winger") ||
    text.includes("midfield")
  ) {
    return "MF";
  }

  if (
    text === "fw" ||
    text.includes("forward") ||
    text.includes("striker") ||
    text.includes("attacker")
  ) {
    return "FW";
  }

  return "";
}

function parseNumber(value: string): number | null {
  const match = value.replace(/,/g, "").match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

function parseAge(value: string): number | null {
  const cleaned = value.trim();

  const parenthesisAgeMatches = Array.from(cleaned.matchAll(/\((\d{1,2})\)/g));
  if (parenthesisAgeMatches.length > 0) {
    return Number(parenthesisAgeMatches[parenthesisAgeMatches.length - 1][1]);
  }

  const standaloneMatches = Array.from(cleaned.matchAll(/\b(\d{1,2})\b/g)).map(
    (m) => Number(m[1])
  );

  const validAge = standaloneMatches.find((n) => n >= 15 && n <= 50);
  return validAge ?? null;
}

function extractTables(html: string) {
  return Array.from(html.matchAll(/<table[^>]*>[\s\S]*?<\/table>/gi)).map(
    (match) => match[0]
  );
}

function extractRows(tableHtml: string) {
  return Array.from(tableHtml.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)).map(
    (match) => match[0]
  );
}

function extractCells(rowHtml: string) {
  return Array.from(rowHtml.matchAll(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi)).map(
    (match) => match[0]
  );
}

function cellTag(cellHtml: string) {
  const match = cellHtml.match(/^<\s*(t[hd])/i);
  return match?.[1]?.toLowerCase() ?? "td";
}

function findColumnIndex(headers: string[], variants: string[]) {
  return headers.findIndex((header) =>
    variants.some((variant) => header.includes(variant))
  );
}

function tableScore(tableHtml: string) {
  const rows = extractRows(tableHtml);
  let bestHeaderScore = 0;

  for (const row of rows.slice(0, 6)) {
    const cells = extractCells(row);
    const headerTexts = cells.map((cell) => stripTags(cell).toLowerCase());

    const score =
      (headerTexts.some((h) => h.includes("player") || h.includes("name")) ? 3 : 0) +
      (headerTexts.some((h) => h === "pos" || h.includes("position")) ? 3 : 0) +
      (headerTexts.some((h) => h.includes("club")) ? 2 : 0) +
      (headerTexts.some((h) => h.includes("caps")) ? 2 : 0) +
      (headerTexts.some((h) => h.includes("goals") || h === "gls") ? 2 : 0) +
      (headerTexts.some((h) => h.includes("age") || h.includes("date of birth")) ? 1 : 0);

    bestHeaderScore = Math.max(bestHeaderScore, score);
  }

  const lower = tableHtml.toLowerCase();

  return (
    bestHeaderScore +
    (lower.includes("current squad") ? 4 : 0) +
    (lower.includes("wikitable") ? 1 : 0)
  );
}

function findBestSquadTable(html: string) {
  const tables = extractTables(html);

  const scored = tables
    .map((table) => ({ table, score: tableScore(table) }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].table : null;
}

function getLikelyPlayerName(cellHtml: string, text: string) {
  const links = extractWikiLinks(cellHtml);

  const linkedName = links.find(
    (value) =>
      /^[A-ZÀ-ÿ][A-Za-zÀ-ÿ'´`.\- ]{1,}$/.test(value) &&
      value.split(" ").length >= 2
  );

  if (linkedName) {
    return removeCaptainAndNotes(linkedName);
  }

  return removeCaptainAndNotes(text);
}

function parsePlayersFromTable(tableHtml: string): ParsedPlayer[] {
  const rows = extractRows(tableHtml);
  const parsed: ParsedPlayer[] = [];

  let headers: string[] = [];
  let lastKnownPosition = "";

  for (const row of rows) {
    const cells = extractCells(row);
    if (cells.length < 2) continue;

    const headerLike = cells.every((cell) => cellTag(cell) === "th");
    const texts = cells.map((cell) => stripTags(cell));
    const lowerTexts = texts.map((text) => text.toLowerCase());

    const hasHeaderKeywords =
      lowerTexts.some((t) => t.includes("player") || t.includes("name")) &&
      lowerTexts.some((t) => t === "pos" || t.includes("position"));

    if (headerLike || hasHeaderKeywords) {
      headers = lowerTexts;
      continue;
    }

    if (headers.length === 0) {
      continue;
    }

    const nameIndex = findColumnIndex(headers, ["name", "player"]);
    const posIndex = findColumnIndex(headers, ["pos", "position"]);
    const clubIndex = findColumnIndex(headers, ["club", "team"]);
    const ageIndex = findColumnIndex(headers, ["age", "date of birth"]);
    const capsIndex = findColumnIndex(headers, ["caps"]);
    const goalsIndex = findColumnIndex(headers, ["goals", "goal", "gls"]);

    if (nameIndex === -1) {
      continue;
    }

    const rawNameCell = cells[nameIndex] ?? "";
    const rawNameText = texts[nameIndex] ?? "";
    const rawPosText = posIndex >= 0 ? texts[posIndex] ?? "" : "";
    const rawClubText = clubIndex >= 0 ? texts[clubIndex] ?? "" : "";
    const rawAgeText = ageIndex >= 0 ? texts[ageIndex] ?? "" : "";
    const rawCapsText = capsIndex >= 0 ? texts[capsIndex] ?? "" : "";
    const rawGoalsText = goalsIndex >= 0 ? texts[goalsIndex] ?? "" : "";

    const name = getLikelyPlayerName(rawNameCell, rawNameText);
    const normalizedPos = normalizePosition(rawPosText) || lastKnownPosition;

    if (normalizedPos) {
      lastKnownPosition = normalizedPos;
    }

    if (!name || name.length < 3) continue;
    if (!normalizedPos) continue;

    if (
      /^(current squad|players|pos|player|name|club|caps|goals|age)$/i.test(name)
    ) {
      continue;
    }

    parsed.push({
      name,
      position: normalizedPos,
      club: rawClubText ? rawClubText.trim() : null,
      age: parseAge(rawAgeText),
      caps: parseNumber(rawCapsText),
      goals: parseNumber(rawGoalsText),
    });
  }

  const unique = new Map<string, ParsedPlayer>();

  for (const player of parsed) {
    const key = player.name.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, player);
    }
  }

  return Array.from(unique.values());
}

async function fetchWikipediaHtml(title: string) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", title);
  url.searchParams.set("prop", "text");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Kunde inte hämta data från Wikipedia");
  }

  const json = await response.json();
  const html = json?.parse?.text;

  if (!html || typeof html !== "string") {
    throw new Error("Wikipedia-sidan kunde inte tolkas");
  }

  return html;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await createClient();

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, name, wikipedia_title")
      .eq("id", teamId)
      .single<TeamRow>();

    if (teamError || !team) {
      return NextResponse.json(
        { error: "Kunde inte hitta laget" },
        { status: 404 }
      );
    }

    if (!team.wikipedia_title) {
      return NextResponse.json(
        {
          error:
            "Laget saknar wikipedia_title. Lägg till Wikipedia-titel i teams-tabellen först.",
        },
        { status: 400 }
      );
    }

    const html = await fetchWikipediaHtml(team.wikipedia_title);

    let squadTable = findBestSquadTable(html);

    if (!squadTable) {
      const tables = extractTables(html);
      squadTable =
        tables.find((table) => table.toLowerCase().includes("wikitable")) ?? null;
    }

    if (!squadTable) {
      return NextResponse.json(
        {
          error: "Ingen tabell hittades på Wikipedia-sidan.",
        },
        { status: 400 }
      );
    }

    const players = parsePlayersFromTable(squadTable);

    if (players.length === 0) {
      return NextResponse.json(
        {
          error: "Parsern hittade inga spelare i tabellen.",
          debug: {
            team: team.name,
            wikipediaTitle: team.wikipedia_title,
            tablePreview: squadTable.slice(0, 800),
          },
        },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from("team_players")
      .delete()
      .eq("team_id", teamId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }

    const rows = players.map((player) => ({
      team_id: teamId,
      name: player.name,
      position: player.position,
      club: player.club,
      age: player.age,
      caps: player.caps,
      goals: player.goals,
      source: "wikipedia",
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("team_players")
      .insert(rows)
      .select("*");

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      team: team.name,
      count: inserted?.length ?? rows.length,
      players: inserted ?? [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Okänt fel vid Wikipedia-import";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}