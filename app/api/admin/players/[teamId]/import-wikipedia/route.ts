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
      .replace(/<[^>]+>/g, " ")
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
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
  const text = value.toLowerCase();

  if (
    text.includes("goalkeeper") ||
    text === "gk" ||
    text.includes("keeper")
  ) {
    return "GK";
  }

  if (
    text.includes("defender") ||
    text === "df" ||
    text.includes("back")
  ) {
    return "DF";
  }

  if (
    text.includes("midfielder") ||
    text === "mf" ||
    text.includes("winger")
  ) {
    return "MF";
  }

  if (
    text.includes("forward") ||
    text.includes("striker") ||
    text === "fw"
  ) {
    return "FW";
  }

  return value.toUpperCase().trim() || "MF";
}

function parseNumber(value: string): number | null {
  const match = value.replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function parseAge(value: string): number | null {
  const cleaned = value.trim();

  const ageInParenthesis = cleaned.match(/\((\d{1,2})\)/);
  if (ageInParenthesis) {
    return Number(ageInParenthesis[1]);
  }

  const standaloneAge = cleaned.match(/\b(\d{1,2})\b/);
  if (standaloneAge) {
    const age = Number(standaloneAge[1]);
    if (age >= 15 && age <= 50) {
      return age;
    }
  }

  return null;
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

function rowLooksLikeHeader(cells: string[]) {
  const joined = cells.map(stripTags).join(" | ").toLowerCase();

  return (
    joined.includes("pos") ||
    joined.includes("position") ||
    joined.includes("player") ||
    joined.includes("club") ||
    joined.includes("caps") ||
    joined.includes("goals") ||
    joined.includes("date of birth") ||
    joined.includes("age")
  );
}

function findCurrentSquadTable(html: string) {
  const tables = extractTables(html);

  for (const table of tables) {
    const lower = table.toLowerCase();

    const looksRelevant =
      lower.includes("current squad") ||
      lower.includes("players") ||
      lower.includes("wikitable");

    const hasImportantColumns =
      lower.includes("caps") &&
      lower.includes("goals") &&
      (lower.includes("club") || lower.includes("position"));

    if (looksRelevant && hasImportantColumns) {
      return table;
    }
  }

  for (const table of tables) {
    const lower = table.toLowerCase();
    if (
      lower.includes("caps") &&
      lower.includes("goals") &&
      lower.includes("club") &&
      (lower.includes("position") || lower.includes("pos"))
    ) {
      return table;
    }
  }

  return null;
}

function findColumnIndex(headers: string[], variants: string[]) {
  return headers.findIndex((header) =>
    variants.some((variant) => header.includes(variant))
  );
}

function parsePlayersFromTable(tableHtml: string): ParsedPlayer[] {
  const rows = extractRows(tableHtml);
  const parsed: ParsedPlayer[] = [];

  let headers: string[] = [];

  for (const row of rows) {
    const cells = extractCells(row);
    if (cells.length < 3) continue;

    const cellTexts = cells.map((cell) => stripTags(cell).toLowerCase());

    if (rowLooksLikeHeader(cells)) {
      headers = cellTexts;
      continue;
    }

    if (headers.length === 0) {
      continue;
    }

    const nameIndex = findColumnIndex(headers, ["name", "player"]);
    const posIndex = findColumnIndex(headers, ["pos", "position"]);
    const clubIndex = findColumnIndex(headers, ["club"]);
    const ageIndex = findColumnIndex(headers, ["age", "date of birth"]);
    const capsIndex = findColumnIndex(headers, ["caps"]);
    const goalsIndex = findColumnIndex(headers, ["goals", "goal"]);

    if (nameIndex === -1 || posIndex === -1) {
      continue;
    }

    const values = cells.map((cell) => stripTags(cell));

    const rawName = values[nameIndex] ?? "";
    const rawPosition = values[posIndex] ?? "";
    const rawClub = clubIndex >= 0 ? values[clubIndex] ?? "" : "";
    const rawAge = ageIndex >= 0 ? values[ageIndex] ?? "" : "";
    const rawCaps = capsIndex >= 0 ? values[capsIndex] ?? "" : "";
    const rawGoals = goalsIndex >= 0 ? values[goalsIndex] ?? "" : "";

    const name = removeCaptainAndNotes(rawName);
    if (!name) continue;

    parsed.push({
      name,
      position: normalizePosition(rawPosition),
      club: rawClub ? rawClub.trim() : null,
      age: parseAge(rawAge),
      caps: parseNumber(rawCaps),
      goals: parseNumber(rawGoals),
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
    const squadTable = findCurrentSquadTable(html);

    if (!squadTable) {
      return NextResponse.json(
        {
          error:
            "Kunde inte hitta tabellen för Current squad på Wikipedia-sidan.",
        },
        { status: 400 }
      );
    }

    const players = parsePlayersFromTable(squadTable);

    if (players.length === 0) {
      return NextResponse.json(
        {
          error:
            "Kunde inte läsa ut några spelare från Current squad-tabellen.",
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