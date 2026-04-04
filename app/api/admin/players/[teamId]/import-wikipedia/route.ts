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

type WikiSection = {
  index: string;
  line: string;
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
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
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
        !/^(club|caps|goals|pos|player|name|age|no\.?)$/i.test(text)
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
    text.includes("full-back") ||
    text.includes("back")
  ) {
    return "DF";
  }

  if (
    text === "mf" ||
    text.includes("midfielder") ||
    text.includes("midfield") ||
    text.includes("winger")
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

function getLikelyPlayerName(cellHtml: string, fallbackText: string) {
  const links = extractWikiLinks(cellHtml);

  const linkedName = links.find(
    (value) =>
      /^[A-ZÀ-ÿ][A-Za-zÀ-ÿ'´`.\- ]+$/.test(value) &&
      value.split(" ").length >= 2 &&
      !/^(fifa|uefa|caf|afc|concacaf|club|caps|goals)$/i.test(value)
  );

  if (linkedName) {
    return removeCaptainAndNotes(linkedName);
  }

  return removeCaptainAndNotes(fallbackText);
}

function isRecentCallupsTable(tableHtml: string) {
  const lower = tableHtml.toLowerCase();
  return (
    lower.includes("recent call-ups") ||
    lower.includes("recent call ups") ||
    lower.includes("recent call-up") ||
    lower.includes("recent callup")
  );
}

function isLikelySquadTable(tableHtml: string) {
  if (isRecentCallupsTable(tableHtml)) return false;

  const rows = extractRows(tableHtml).slice(0, 8);
  let headerTexts: string[] = [];

  for (const row of rows) {
    const cells = extractCells(row);
    if (cells.length === 0) continue;

    const texts = cells.map((cell) => stripTags(cell).toLowerCase());

    if (
      texts.some((t) => t.includes("player") || t.includes("name")) &&
      (
        texts.some((t) => t === "pos" || t.includes("position")) ||
        texts.some((t) => t.includes("club")) ||
        texts.some((t) => t.includes("caps"))
      )
    ) {
      headerTexts = texts;
      break;
    }
  }

  if (headerTexts.length === 0) return false;

  const hasName = headerTexts.some(
    (t) => t.includes("player") || t.includes("name")
  );
  const hasPos = headerTexts.some(
    (t) => t === "pos" || t.includes("position")
  );
  const hasClub = headerTexts.some((t) => t.includes("club"));
  const hasCaps = headerTexts.some((t) => t.includes("caps"));
  const hasGoals = headerTexts.some(
    (t) => t.includes("goals") || t === "gls"
  );

  return hasName && (hasPos || hasClub || hasCaps || hasGoals);
}

function parsePlayersFromTable(tableHtml: string): ParsedPlayer[] {
  const rows = extractRows(tableHtml);
  const parsed: ParsedPlayer[] = [];

  let headers: string[] = [];
  let lastKnownPosition = "";

  for (const row of rows) {
    const cells = extractCells(row);
    if (cells.length < 2) continue;

    const texts = cells.map((cell) => stripTags(cell));
    const lowerTexts = texts.map((text) => text.toLowerCase());
    const onlyHeaders = cells.every((cell) => cellTag(cell) === "th");

    const headerLike =
      onlyHeaders ||
      (
        lowerTexts.some((t) => t.includes("player") || t.includes("name")) &&
        (
          lowerTexts.some((t) => t === "pos" || t.includes("position")) ||
          lowerTexts.some((t) => t.includes("club")) ||
          lowerTexts.some((t) => t.includes("caps"))
        )
      );

    if (headerLike) {
      headers = lowerTexts;
      continue;
    }

    if (headers.length === 0) continue;

    const nameIndex = findColumnIndex(headers, ["name", "player"]);
    const posIndex = findColumnIndex(headers, ["pos", "position"]);
    const clubIndex = findColumnIndex(headers, ["club", "team"]);
    const ageIndex = findColumnIndex(headers, ["age", "date of birth"]);
    const capsIndex = findColumnIndex(headers, ["caps"]);
    const goalsIndex = findColumnIndex(headers, ["goals", "goal", "gls"]);

    if (nameIndex === -1) continue;

    const rawNameCell = cells[nameIndex] ?? "";
    const rawNameText = texts[nameIndex] ?? "";
    const rawPosText = posIndex >= 0 ? texts[posIndex] ?? "" : "";
    const rawClubText = clubIndex >= 0 ? texts[clubIndex] ?? "" : "";
    const rawAgeText = ageIndex >= 0 ? texts[ageIndex] ?? "" : "";
    const rawCapsText = capsIndex >= 0 ? texts[capsIndex] ?? "" : "";
    const rawGoalsText = goalsIndex >= 0 ? texts[goalsIndex] ?? "" : "";

    const possibleGroupPosition =
      texts.length <= 2 ? normalizePosition(texts.join(" ")) : "";

    if (!rawPosText && possibleGroupPosition) {
      lastKnownPosition = possibleGroupPosition;
      continue;
    }

    const name = getLikelyPlayerName(rawNameCell, rawNameText);

    if (normalizePosition(rawNameText) && texts.length <= 2) {
      lastKnownPosition = normalizePosition(rawNameText);
      continue;
    }

    const normalizedPos = normalizePosition(rawPosText) || lastKnownPosition;

    if (normalizedPos) {
      lastKnownPosition = normalizedPos;
    }

    if (!name || name.length < 3) continue;
    if (!normalizedPos) continue;

    if (
      /^(current squad|players|pos|player|name|club|caps|goals|age|no\.?)$/i.test(name)
    ) {
      continue;
    }

    if (/^\d+$/.test(name)) {
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

async function fetchWikipediaSections(title: string): Promise<WikiSection[]> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", title);
  url.searchParams.set("prop", "sections");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");
  url.searchParams.set("redirects", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "AddesVMTips/1.0 (contact: admin@addesvmtips.se)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Kunde inte hämta sektioner från Wikipedia");
  }

  const json = await response.json();
  return (json?.parse?.sections ?? []) as WikiSection[];
}

async function fetchWikipediaSectionHtml(
  title: string,
  sectionIndex: string
): Promise<string> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", title);
  url.searchParams.set("section", sectionIndex);
  url.searchParams.set("prop", "text");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");
  url.searchParams.set("redirects", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "AddesVMTips/1.0 (contact: admin@addesvmtips.se)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Kunde inte hämta Current squad-sektion från Wikipedia");
  }

  const json = await response.json();
  const html = json?.parse?.text;

  if (!html || typeof html !== "string") {
    throw new Error("Current squad-sektionen kunde inte tolkas");
  }

  return html;
}

async function fetchWikipediaHtml(title: string): Promise<string> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", title);
  url.searchParams.set("prop", "text");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");
  url.searchParams.set("redirects", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "AddesVMTips/1.0 (contact: admin@addesvmtips.se)",
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

async function findBestSquadTable(title: string) {
  const sections = await fetchWikipediaSections(title);

  const currentSquadSection = sections.find((section) =>
    section.line.toLowerCase().includes("current squad")
  );

  if (currentSquadSection) {
    const sectionHtml = await fetchWikipediaSectionHtml(
      title,
      currentSquadSection.index
    );

    const sectionTables = extractTables(sectionHtml).filter(isLikelySquadTable);

    if (sectionTables.length > 0) {
      return {
        table: sectionTables[0],
        source: "section",
        section: currentSquadSection.line,
      };
    }
  }

  const fullHtml = await fetchWikipediaHtml(title);
  const allTables = extractTables(fullHtml).filter(isLikelySquadTable);

  if (allTables.length > 0) {
    return {
      table: allTables[0],
      source: "full-page-fallback",
      section: null,
    };
  }

  return {
    table: null,
    source: currentSquadSection ? "section" : "no-current-squad-section",
    section: currentSquadSection?.line ?? null,
  };
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

    const squadResult = await findBestSquadTable(team.wikipedia_title);
    const squadTable = squadResult.table;

    if (!squadTable) {
      return NextResponse.json(
        {
          error: "Kunde inte hitta någon läsbar spelartrupp på Wikipedia-sidan.",
          debug: {
            team: team.name,
            wikipediaTitle: team.wikipedia_title,
            source: squadResult.source,
            section: squadResult.section,
          },
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
            source: squadResult.source,
            section: squadResult.section,
            tablePreview: squadTable.slice(0, 1200),
          },
        },
        { status: 400 }
      );
    }

    if (players.length > 35) {
      return NextResponse.json(
        {
          error: "För många spelare hittades. Troligen valdes fel tabell.",
          debug: {
            team: team.name,
            wikipediaTitle: team.wikipedia_title,
            source: squadResult.source,
            section: squadResult.section,
            count: players.length,
            names: players.slice(0, 20).map((player) => player.name),
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
      debug: {
        source: squadResult.source,
        section: squadResult.section,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Okänt fel vid Wikipedia-import";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}