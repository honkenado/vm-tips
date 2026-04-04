import { NextResponse } from "next/server";

export const revalidate = 3600;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
};

type RankedNewsItem = NewsItem & {
  score: number;
};

type TeamNewsConfig = {
  slug: string;
  teamName: string;
  title: string;
  query: string;
  hl: string;
  gl: string;
  ceid: string;
  includeTerms: string[];
  strongIncludeTerms: string[];
  excludeTerms: string[];
  strongExcludeTerms: string[];
  maxItems: number;
};

type TeamNewsOverride = {
  teamName?: string;
  aliases?: string[];
  strongAliases?: string[];
  players?: string[];
  extraExcludeTerms?: string[];
  extraStrongExcludeTerms?: string[];
  hl?: string;
  gl?: string;
  ceid?: string;
};

const TEAM_NEWS_OVERRIDES: Record<string, TeamNewsOverride> = {
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
    extraExcludeTerms: [
      "Club America",
      "Club América",
      "Chivas",
      "Tigres",
      "Monterrey",
      "Liga MX",
    ],
  },

  sydafrika: {
    teamName: "South Africa",
    aliases: [
      "South Africa national team",
      "South Africa football team",
      "Bafana Bafana",
    ],
    strongAliases: [
      "South Africa national team",
      "Bafana Bafana",
    ],
  },

  sydkorea: {
    teamName: "South Korea",
    aliases: [
      "South Korea national team",
      "South Korea football team",
      "Korea Republic",
      "Korea Republic national team",
    ],
    strongAliases: [
      "South Korea national team",
      "Korea Republic national team",
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
    strongAliases: [
      "Czech Republic national team",
      "Czechia national team",
    ],
  },
};

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripCdata(text: string) {
  return text
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

function stripHtml(text: string) {
  return decodeHtmlEntities(
    text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  );
}

function extractTag(content: string, tag: string) {
  const match = content.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return "";
  return decodeHtmlEntities(stripCdata(match[1].trim()));
}

function parseRssItems(xml: string): NewsItem[] {
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  return itemMatches
    .map((match) => {
      const itemXml = match[1];

      const title = extractTag(itemXml, "title");
      const link = extractTag(itemXml, "link");
      const pubDate = extractTag(itemXml, "pubDate");
      const source = extractTag(itemXml, "source");
      const description = stripHtml(extractTag(itemXml, "description"));

      return {
        title,
        link,
        pubDate,
        source,
        description,
      };
    })
    .filter((item) => item.title && item.link);
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsPhrase(text: string, phrase: string) {
  const normalizedText = normalizeText(text);
  const normalizedPhrase = normalizeText(phrase);

  if (!normalizedPhrase.trim()) return false;

  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapeRegExp(normalizedPhrase)}([^a-z0-9]|$)`,
    "i"
  );

  return pattern.test(normalizedText);
}

function countMatches(text: string, phrases: string[]) {
  let total = 0;

  for (const phrase of phrases) {
    if (containsPhrase(text, phrase)) {
      total += 1;
    }
  }

  return total;
}

function slugToTeamName(slug: string) {
  return slug
    .split("-")
    .map((part) => {
      if (!part) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function getGenericAliases(teamName: string) {
  return [
    teamName,
    `${teamName} national team`,
    `${teamName} football team`,
    `${teamName} national football team`,
  ];
}

function getGenericStrongAliases(teamName: string) {
  return [
    `${teamName} national team`,
    `${teamName} football team`,
    `${teamName} national football team`,
  ];
}

function getBaseExcludeTerms() {
  return [
    "betting",
    "odds",
    "prediction",
    "predictions",
    "fantasy",
    "power ranking",
    "power rankings",
    "schedule",
    "fixtures",
    "draw",
    "group stage",
    "world cup odds",
    "best bets",
    "tips",
  ];
}

function getBaseStrongExcludeTerms() {
  return [
    "women",
    "womens",
    "women's",
    "female",
    "girls",
    "u17",
    "u-17",
    "under-17",
    "u20",
    "u-20",
    "under-20",
    "u21",
    "u-21",
    "under-21",
    "u23",
    "u-23",
    "under-23",
    "olympic team",
    "futsal",
    "beach soccer",
  ];
}

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function buildGoogleNewsQuery(config: {
  teamName: string;
  aliases: string[];
  players: string[];
}) {
  const mainTerms = uniq([
    config.teamName,
    ...config.aliases,
  ]).map((term) => `"${term}"`);

  const playerTerms = uniq(config.players).map((term) => `"${term}"`);

  const positiveParts: string[] = [];

  if (mainTerms.length > 0) {
    positiveParts.push(`(${mainTerms.join(" OR ")})`);
  }

  if (playerTerms.length > 0) {
    positiveParts.push(`(${playerTerms.join(" OR ")})`);
  }

  const negativeParts = [
    "-women",
    "-womens",
    `-"women's"`,
    "-female",
    "-girls",
    "-u17",
    '-"under-17"',
    "-u20",
    '-"under-20"',
    "-u21",
    '-"under-21"',
    "-u23",
    '-"under-23"',
    "-futsal",
    '-"beach soccer"',
    "-odds",
    "-betting",
    "-prediction",
    "-fantasy",
  ];

  return [...positiveParts, ...negativeParts].join(" ");
}

function isLikelyGenericTournamentArticle(text: string, config: TeamNewsConfig) {
  const genericTerms = [
    "world cup",
    "fifa world cup",
    "vm",
    "fotbolls-vm",
    "tournament",
    "draw",
    "fixtures",
    "schedule",
    "prediction",
    "betting",
    "odds",
    "power rankings",
    "ranking",
    "group stage",
    "preview",
  ];

  const genericHits = countMatches(text, genericTerms);

  const teamHits =
    countMatches(text, config.includeTerms) +
    countMatches(text, config.strongIncludeTerms);

  return genericHits >= 2 && teamHits <= 1;
}

function shouldRejectItem(item: NewsItem, config: TeamNewsConfig) {
  const combined = `${item.title} ${item.description} ${item.source}`;
  const normalized = normalizeText(combined);

  const strongExcludeHits = countMatches(normalized, config.strongExcludeTerms);
  if (strongExcludeHits > 0) {
    return true;
  }

  const includeHits =
    countMatches(normalized, config.includeTerms) +
    countMatches(normalized, config.strongIncludeTerms);

  if (includeHits === 0) {
    return true;
  }

  if (isLikelyGenericTournamentArticle(normalized, config)) {
    return true;
  }

  return false;
}

function scoreNewsItem(item: NewsItem, config: TeamNewsConfig) {
  const title = normalizeText(item.title);
  const description = normalizeText(item.description);
  const source = normalizeText(item.source);
  const combined = `${title} ${description} ${source}`;

  let score = 0;

  const includeInTitle = countMatches(title, config.includeTerms);
  const includeInDescription = countMatches(description, config.includeTerms);
  const strongIncludeInTitle = countMatches(title, config.strongIncludeTerms);
  const strongIncludeInDescription = countMatches(
    description,
    config.strongIncludeTerms
  );

  const excludeInTitle = countMatches(title, config.excludeTerms);
  const excludeInDescription = countMatches(description, config.excludeTerms);
  const strongExcludeInTitle = countMatches(
    title,
    config.strongExcludeTerms
  );
  const strongExcludeInDescription = countMatches(
    description,
    config.strongExcludeTerms
  );

  score += includeInTitle * 4;
  score += includeInDescription * 2;
  score += strongIncludeInTitle * 8;
  score += strongIncludeInDescription * 4;

  score -= excludeInTitle * 5;
  score -= excludeInDescription * 3;
  score -= strongExcludeInTitle * 12;
  score -= strongExcludeInDescription * 8;

  if (containsPhrase(title, config.teamName)) score += 4;
  if (containsPhrase(description, config.teamName)) score += 2;

  if (containsPhrase(title, "national team")) score += 3;
  if (containsPhrase(description, "national team")) score += 1;

  if (containsPhrase(title, "squad")) score += 2;
  if (containsPhrase(title, "lineup")) score += 2;
  if (containsPhrase(title, "roster")) score += 2;
  if (containsPhrase(title, "call-up")) score += 2;
  if (containsPhrase(title, "call up")) score += 2;
  if (containsPhrase(title, "coach")) score += 1;
  if (containsPhrase(title, "manager")) score += 1;
  if (containsPhrase(title, "injury")) score += 1;
  if (containsPhrase(title, "injured")) score += 1;

  if (isLikelyGenericTournamentArticle(combined, config)) {
    score -= 8;
  }

  return score;
}

function dedupeItems(items: RankedNewsItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const normalizedTitle = normalizeText(item.title)
      .replace(/\s*-\s*[^-]+$/, "")
      .trim();

    const normalizedLink = item.link
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .trim();

    const key = `${normalizedTitle}::${normalizedLink}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function sortByDateDesc(a: NewsItem, b: NewsItem) {
  const aTime = Date.parse(a.pubDate || "") || 0;
  const bTime = Date.parse(b.pubDate || "") || 0;
  return bTime - aTime;
}

function rankAndFilterItems(items: NewsItem[], config: TeamNewsConfig) {
  const ranked = items
    .filter((item) => !shouldRejectItem(item, config))
    .map((item) => ({
      ...item,
      score: scoreNewsItem(item, config),
    }))
    .filter((item) => item.score >= 4)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const aTime = Date.parse(a.pubDate || "") || 0;
      const bTime = Date.parse(b.pubDate || "") || 0;
      return bTime - aTime;
    });

  return dedupeItems(ranked).slice(0, config.maxItems);
}

function getTeamNewsConfig(slug: string): TeamNewsConfig {
  const normalizedSlug = slug.toLowerCase();
  const override = TEAM_NEWS_OVERRIDES[normalizedSlug];

  const fallbackTeamName = slugToTeamName(normalizedSlug);
  const teamName = override?.teamName ?? fallbackTeamName;

  const aliases = uniq([
    ...getGenericAliases(teamName),
    ...(override?.aliases ?? []),
  ]);

  const strongAliases = uniq([
    ...getGenericStrongAliases(teamName),
    ...(override?.strongAliases ?? []),
  ]);

  const excludeTerms = uniq([
    ...getBaseExcludeTerms(),
    ...(override?.extraExcludeTerms ?? []),
  ]);

  const strongExcludeTerms = uniq([
    ...getBaseStrongExcludeTerms(),
    ...(override?.extraStrongExcludeTerms ?? []),
  ]);

  const players = uniq(override?.players ?? []);

  return {
    slug: normalizedSlug,
    teamName,
    title: `Senaste om ${teamName}`,
    query: buildGoogleNewsQuery({
      teamName,
      aliases,
      players,
    }),
    hl: override?.hl ?? "en",
    gl: override?.gl ?? "US",
    ceid: override?.ceid ?? "US:en",
    includeTerms: uniq([teamName, ...aliases, ...players]),
    strongIncludeTerms: strongAliases,
    excludeTerms,
    strongExcludeTerms,
    maxItems: 5,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const config = getTeamNewsConfig(slug);

  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
    config.query
  )}&hl=${config.hl}&gl=${config.gl}&ceid=${config.ceid}`;

  try {
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Mozilla/5.0 AddesVMTips/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Kunde inte hämta nyheter", items: [], title: config.title },
        { status: 500 }
      );
    }

    const xml = await response.text();
    const rawItems = parseRssItems(xml).sort(sortByDateDesc);
    const rankedItems = rankAndFilterItems(rawItems, config);

    return NextResponse.json({
      title: config.title,
      items: rankedItems.map(({ score, ...item }) => item),
    });
  } catch (error) {
    console.error("Team news fetch error:", error);

    return NextResponse.json(
      { error: "Kunde inte hämta nyheter", items: [], title: config.title },
      { status: 500 }
    );
  }
}