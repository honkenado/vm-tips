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
  shirtNumber: number | null;
};

type WikiSection = {
  index: string;
  line: string;
};

type SquadTableResult = {
  table: string | null;
  source: "section" | "full-page-fallback" | "no-current-squad-section";
  section: string | null;
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
      .replace(
        /<span[^>]*style="[^"]*display\s*:\s*none[^"]*"[^>]*>[\s\S]*?<\/span>/gi,
        " "
      )
      .replace(
        /<span[^>]*class="[^"]*flagicon[^"]*"[^>]*>[\s\S]*?<\/span>/gi,
        " "
      )
      .replace(/<img[^>]*>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractTables(html: string) {
  return Array.from(html.matchAll(/<table[^>]*>[\s\S]*?<\/table>/gi)).map(
    (m) => m[0]
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

function cellTag(cellHtml: string) {
  const match = cellHtml.match(/^<\s*(t[hd])/i);
  return match?.[1]?.toLowerCase() ?? "td";
}

function findColumnIndex(headers: string[], variants: string[]) {
  return headers.findIndex((h) => variants.some((v) => h.includes(v)));
}

function normalizePosition(value: string) {
  const text = value.toLowerCase().replace(/\s+/g, " ").trim();

  if (/\bgk\b/.test(text) || text.includes("goalkeeper")) return "GK";
  if (/\bdf\b/.test(text) || text.includes("defender")) return "DF";
  if (/\bmf\b/.test(text) || text.includes("midfielder")) return "MF";
  if (/\bfw\b/.test(text) || text.includes("forward")) return "FW";

  return "";
}

function parseNumber(value: string): number | null {
  const match = value.replace(/,/g, "").match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

function parseShirtNumber(value: string): number | null {
  const match = value.match(/\b\d{1,2}\b/);
  return match ? Number(match[0]) : null;
}

function parseAge(value: string): number | null {
  const ageMatch = value.match(/\(age\s*(\d{1,2})\)/i);
  if (ageMatch) return Number(ageMatch[1]);

  const fallback = value.match(/\((\d{1,2})\)/);
  if (fallback) return Number(fallback[1]);

  return null;
}

function isLikelySquadTable(tableHtml: string) {
  const lower = tableHtml.toLowerCase();
  if (lower.includes("recent call")) return false;

  const rows = extractRows(tableHtml).slice(0, 6);

  return rows.some((row) => {
    const text = stripTags(row).toLowerCase();
    return (
      text.includes("player") &&
      text.includes("club") &&
      (text.includes("pos") || text.includes("position"))
    );
  });
}

function chooseBestTable(tables: string[]) {
  return (
    tables
      .map((table) => ({
        table,
        rows: extractRows(table).length,
      }))
      .filter((entry) => entry.rows >= 10 && entry.rows <= 35)
      .sort((a, b) => a.rows - b.rows)[0]?.table ?? null
  );
}

function parsePlayersFromTable(tableHtml: string): ParsedPlayer[] {
  const rows = extractRows(tableHtml);
  let headers: string[] = [];
  const players: ParsedPlayer[] = [];

  for (const row of rows) {
    const cells = extractCells(row);
    const texts = cells.map((cell) => stripTags(cell));
    const lower = texts.map((text) => text.toLowerCase());

    const isHeader =
      cells.every((cell) => cellTag(cell) === "th") ||
      (lower.some((t) => t.includes("player") || t.includes("name")) &&
        (lower.some((t) => t.includes("pos")) ||
          lower.some((t) => t.includes("position"))));

    if (isHeader) {
      headers = lower;
      continue;
    }

    if (headers.length === 0) continue;

    const nameIdx = findColumnIndex(headers, ["name", "player"]);
    const posIdx = findColumnIndex(headers, ["pos", "position"]);
    const clubIdx = findColumnIndex(headers, ["club"]);
    const ageIdx = findColumnIndex(headers, ["age"]);
    const capsIdx = findColumnIndex(headers, ["caps"]);
    const goalsIdx = findColumnIndex(headers, ["goal"]);
    const numberIdx = findColumnIndex(headers, ["no"]);

    if (nameIdx === -1 || posIdx === -1) continue;

    const name = texts[nameIdx]?.trim();
    const position = normalizePosition(texts[posIdx] ?? "");

    if (!name || !position) continue;

    players.push({
      name,
      position,
      club: texts[clubIdx] ?? null,
      age: parseAge(texts[ageIdx] ?? ""),
      caps: parseNumber(texts[capsIdx] ?? ""),
      goals: parseNumber(texts[goalsIdx] ?? ""),
      shirtNumber: parseShirtNumber(texts[numberIdx] ?? ""),
    });
  }

  const unique = new Map<string, ParsedPlayer>();

  for (const player of players) {
    const key = `${player.name.toLowerCase()}-${player.position}`;
    if (!unique.has(key)) {
      unique.set(key, player);
    }
  }

  return Array.from(unique.values());
}

async function fetchSections(title: string): Promise<WikiSection[]> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", title);
  url.searchParams.set("prop", "sections");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");
  url.searchParams.set("redirects", "1");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      "User-Agent": "AddesVMTips/1.0",
    },
  });

  if (!res.ok) {
    throw new Error("Kunde inte hämta Wikipedia-sektioner");
  }

  const json = await res.json();
  return json.parse?.sections ?? [];
}

async function fetchSectionHtml(title: string, index: string) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", title);
  url.searchParams.set("section", index);
  url.searchParams.set("prop", "text");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");
  url.searchParams.set("redirects", "1");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      "User-Agent": "AddesVMTips/1.0",
    },
  });

  if (!res.ok) {
    throw new Error("Kunde inte hämta Wikipedia-sektion");
  }

  const json = await res.json();
  return json.parse?.text ?? "";
}

async function findBestSquadTable(title: string): Promise<SquadTableResult> {
  const sections = await fetchSections(title);

  const section = sections.find((s) =>
    s.line.toLowerCase().includes("current squad")
  );

  if (!section) {
    return {
      table: null,
      source: "no-current-squad-section",
      section: null,
    };
  }

  const html = await fetchSectionHtml(title, section.index);
  const tables = extractTables(html).filter(isLikelySquadTable);
  const table = chooseBestTable(tables);

  if (!table) {
    return {
      table: null,
      source: "section",
      section: section.line,
    };
  }

  return {
    table,
    source: "section",
    section: section.line,
  };
}

export async function POST(
  _req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await context.params;
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
        { error: "Ingen wikipedia_title" },
        { status: 400 }
      );
    }

    const result = await findBestSquadTable(team.wikipedia_title);

    if (!result.table) {
      return NextResponse.json(
        {
          error: "Ingen tabell hittades",
          debug: {
            source: result.source,
            section: result.section,
            wikipediaTitle: team.wikipedia_title,
          },
        },
        { status: 400 }
      );
    }

    const players = parsePlayersFromTable(result.table);

    if (players.length === 0) {
      return NextResponse.json(
        {
          error: "Parsern hittade inga spelare",
          debug: {
            source: result.source,
            section: result.section,
            wikipediaTitle: team.wikipedia_title,
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

    const insertRows = players.map((player) => ({
      team_id: teamId,
      name: player.name,
      position: player.position,
      club: player.club,
      age: player.age,
      caps: player.caps,
      goals: player.goals,
      shirt_number: player.shirtNumber,
      source: "wikipedia",
    }));

    const { error: insertError } = await supabase
      .from("team_players")
      .insert(insertRows);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      count: players.length,
      debug: {
        source: result.source,
        section: result.section,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Okänt fel vid import";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}