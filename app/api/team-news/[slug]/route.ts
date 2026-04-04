import { NextResponse } from "next/server";
import { TEAM_NEWS_OVERRIDES } from "@/lib/team-news-config";

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
  includeTerms: string[];
  strongIncludeTerms: string[];
  excludeTerms: string[];
  strongExcludeTerms: string[];
  footballTerms: string[];
  maxItems: number;
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

function stripCdata(text: string) {
  return text.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
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

function extractSourceFromDescription(description: string) {
  const cleaned = stripHtml(description);

  const sourceSplit = cleaned
    .split(/\s{2,}| {2,}| \u00a0\u00a0 | \u00a0{2,}/g)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sourceSplit.length >= 2) {
    return sourceSplit[sourceSplit.length - 1];
  }

  return "";
}

function parseRssItems(xml: string): NewsItem[] {
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  return itemMatches
    .map((match) => {
      const itemXml = match[1];

      const title = extractTag(itemXml, "title");
      const link = extractTag(itemXml, "link");
      const pubDate = extractTag(itemXml, "pubDate");
      const sourceFromTag = extractTag(itemXml, "source");
      const rawDescription = extractTag(itemXml, "description");
      const description = stripHtml(rawDescription);
      const source = sourceFromTag || extractSourceFromDescription(rawDescription);

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

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function getGenericAliases(teamName: string) {
  return [
    teamName,
    `${teamName} national team`,
    `${teamName} football team`,
    `${teamName} national football team`,
    `${teamName} soccer team`,
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
    "best bets",
    "tips",
    "stocks",
    "economy",
    "trade",
    "tariffs",
    "diplomacy",
    "war",
    "missile",
    "cyber",
    "malware",
    "defense",
    "defence",
    "election",
    "parliament",
    "president",
    "prime minister",
    "tourism",
    "travel",
    "visa",
    "daily life",
    "easter",
    "where to watch",
    "live stream",
    "live streams",
    "tv channel",
    "tv channels",
    "how to watch",
    "broadcast",
    "streaming",
    "flag football",
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
    "u19",
    "u-19",
    "under-19",
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
    "olympic squad",
    "futsal",
    "beach soccer",
    "basketball",
    "baseball",
    "volleyball",
    "handball",
    "hockey",
    "esports",
  ];
}

function getBaseFootballTerms() {
  return [
    "football",
    "soccer",
    "fifa",
    "uefa",
    "afc",
    "caf",
    "concacaf",
    "conmebol",
    "ofc",
    "national team",
    "football team",
    "national football team",
    "soccer team",
    "coach",
    "manager",
    "squad",
    "roster",
    "lineup",
    "starting xi",
    "selection",
    "call-up",
    "call up",
    "callups",
    "captain",
    "goalkeeper",
    "defender",
    "midfielder",
    "forward",
    "striker",
    "winger",
    "qualifier",
    "qualifiers",
    "world cup qualifier",
    "world cup qualifying",
    "friendly",
    "international break",
    "training camp",
    "injury",
    "injured",
    "returns",
    "recall",
    "match",
    "matches",
  ];
}

function getStrongFootballPhrases() {
  return [
    "national team",
    "football team",
    "national football team",
    "soccer team",
    "coach",
    "manager",
    "squad",
    "roster",
    "lineup",
    "starting xi",
    "call-up",
    "call up",
    "qualifier",
    "qualifiers",
    "world cup qualifier",
    "world cup qualifying",
    "friendly",
    "captain",
    "goalkeeper",
    "defender",
    "midfielder",
    "forward",
    "striker",
    "winger",
    "training camp",
    "injury",
    "injured",
    "recall",
  ];
}

function buildGoogleNewsQuery(config: {
  teamName: string;
  aliases: string[];
  players: string[];
}) {
  const mainTerms = uniq([config.teamName, ...config.aliases]).map(
    (term) => `"${term}"`
  );

  const playerTerms = uniq(config.players).map((term) => `"${term}"`);

  const footballTerms = [
    '"football"',
    '"soccer"',
    '"national team"',
    '"football team"',
    '"squad"',
    '"coach"',
    '"lineup"',
    '"roster"',
    '"qualifier"',
    '"fifa"',
    '"friendly"',
  ];

  const positiveParts: string[] = [];

  if (mainTerms.length > 0) {
    positiveParts.push(`(${mainTerms.join(" OR ")})`);
  }

  positiveParts.push(`(${footballTerms.join(" OR ")})`);

  if (playerTerms.length > 0) {
    positiveParts.push(`(${playerTerms.join(" OR ")})`);
  }

  const freshnessParts = ["when:30d"];

  const negativeParts = [
    "-women",
    "-womens",
    `-"women's"`,
    "-female",
    "-girls",
    "-u17",
    '-"under-17"',
    "-u19",
    '-"under-19"',
    "-u20",
    '-"under-20"',
    "-u21",
    '-"under-21"',
    "-u23",
    '-"under-23"',
    "-olympic",
    "-futsal",
    '-"beach soccer"',
    "-odds",
    "-betting",
    "-prediction",
    "-fantasy",
    "-war",
    "-trade",
    "-defense",
    "-defence",
    "-iran",
    "-malware",
    "-cyber",
    "-diplomacy",
    "-election",
    "-tourism",
    "-visa",
    "-travel",
    "-easter",
  ];

  return [...positiveParts, ...freshnessParts, ...negativeParts].join(" ");
}

function isLikelyGenericTournamentArticle(
  text: string,
  config: TeamNewsConfig
) {
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

function isTooOld(pubDate: string) {
  const timestamp = Date.parse(pubDate || "");
  if (!timestamp) return false;

  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  return now - timestamp > thirtyDays;
}

function isSwedishSource(text: string) {
  const value = text.toLowerCase();

  const swedishIndicators = [
    ".se",
    "aftonbladet",
    "expressen",
    "svt",
    "tv4",
    "fotbollskanalen",
    "svenskafans",
    "dn",
    "svd",
    "gp.se",
    "hd.se",
    "bt.se",
  ];

  return swedishIndicators.some((term) => value.includes(term));
}

function hasFootballContext(text: string, config: TeamNewsConfig) {
  const footballHits = countMatches(text, config.footballTerms);
  const strongHits = countMatches(text, getStrongFootballPhrases());

  return footballHits > 0 || strongHits > 0;
}

function isWatchGuideArticle(item: NewsItem) {
  const normalized = normalizeText(
    `${item.title} ${item.description} ${item.source}`
  );

  const watchGuideTerms = [
    "where to watch",
    "how to watch",
    "live stream",
    "live streams",
    "tv channel",
    "tv channels",
    "broadcast",
    "streaming",
  ];

  return countMatches(normalized, watchGuideTerms) > 0;
}

function isOtherFootballCodeArticle(item: NewsItem) {
  const normalized = normalizeText(
    `${item.title} ${item.description} ${item.source}`
  );

  const wrongFootballTerms = [
    "flag football",
    "nfl",
    "super bowl",
    "touchdown",
    "quarterback",
  ];

  return countMatches(normalized, wrongFootballTerms) > 0;
}

function isGeneralCountryArticle(item: NewsItem, config: TeamNewsConfig) {
  const normalized = normalizeText(
    `${item.title} ${item.description} ${item.source}`
  );

  const includeHits =
    countMatches(normalized, config.includeTerms) +
    countMatches(normalized, config.strongIncludeTerms);

  const footballHits =
    countMatches(normalized, config.footballTerms) +
    countMatches(normalized, getStrongFootballPhrases());

  const generalNewsTerms = [
    "daily life",
    "easter",
    "travel",
    "tourism",
    "visa",
    "war",
    "trade",
    "economy",
    "security",
    "defense",
    "defence",
    "diplomacy",
    "election",
    "president",
    "prime minister",
    "macron",
    "parliament",
    "stocks",
    "tariffs",
    "military",
    "conflict",
    "malware",
    "cyber",
  ];

  const generalHits = countMatches(normalized, generalNewsTerms);

  return includeHits > 0 && footballHits === 0 && generalHits > 0;
}

function looksLikeWrongCountryGeneralNews(
  item: NewsItem,
  config: TeamNewsConfig
) {
  const normalized = normalizeText(
    `${item.title} ${item.description} ${item.source}`
  );

  const teamHits =
    countMatches(normalized, config.includeTerms) +
    countMatches(normalized, config.strongIncludeTerms);

  const footballHits =
    countMatches(normalized, config.footballTerms) +
    countMatches(normalized, getStrongFootballPhrases());

  const nonFootballSignals = [
    "war",
    "trade",
    "tariff",
    "economy",
    "defense",
    "defence",
    "missile",
    "military",
    "cyber",
    "malware",
    "election",
    "diplomacy",
    "security",
    "conflict",
    "stocks",
    "travel",
    "tourism",
    "visa",
    "daily life",
    "easter",
  ];

  const nonFootballHits = countMatches(normalized, nonFootballSignals);

  return teamHits > 0 && footballHits === 0 && nonFootballHits > 0;
}
function isJunkMarketOrGenericWireArticle(item: NewsItem) {
  const normalized = normalizeText(
    `${item.title} ${item.description} ${item.source}`
  );

  const junkTerms = [
    "market",
    "analysis and forecast",
    "forecast to",
    "gmp",
    "cell-selection",
    "cell selection",
    "reagents",
    "industry",
    "size",
    "growth",
    "indexbox",
    "correction",
  ];

  return countMatches(normalized, junkTerms) > 0;
}

function shouldRejectItem(item: NewsItem, config: TeamNewsConfig) {
  const combined = `${item.title} ${item.description} ${item.source}`;
  const normalized = normalizeText(combined);

  if (isTooOld(item.pubDate)) {
    return true;
  }

  if (isWatchGuideArticle(item)) {
    return true;
  }

  if (isOtherFootballCodeArticle(item)) {
    return true;
  }

  if (isJunkMarketOrGenericWireArticle(item)) {
    return true;
  }

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

  if (!hasFootballContext(normalized, config)) {
    return true;
  }

  if (isGeneralCountryArticle(item, config)) {
    return true;
  }

  if (looksLikeWrongCountryGeneralNews(item, config)) {
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

  const footballInTitle = countMatches(title, config.footballTerms);
  const footballInDescription = countMatches(description, config.footballTerms);

  const excludeInTitle = countMatches(title, config.excludeTerms);
  const excludeInDescription = countMatches(description, config.excludeTerms);
  const strongExcludeInTitle = countMatches(title, config.strongExcludeTerms);
  const strongExcludeInDescription = countMatches(
    description,
    config.strongExcludeTerms
  );

  score += includeInTitle * 4;
  score += includeInDescription * 2;
  score += strongIncludeInTitle * 8;
  score += strongIncludeInDescription * 4;

  score += footballInTitle * 4;
  score += footballInDescription * 2;

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
  if (containsPhrase(title, "coach")) score += 2;
  if (containsPhrase(title, "manager")) score += 1;
  if (containsPhrase(title, "captain")) score += 1;
  if (containsPhrase(title, "injury")) score += 1;
  if (containsPhrase(title, "injured")) score += 1;
  if (containsPhrase(title, "qualifier")) score += 2;
  if (containsPhrase(title, "friendly")) score += 1;

  if (isLikelyGenericTournamentArticle(combined, config)) {
    score -= 8;
  }

  if (isGeneralCountryArticle(item, config)) {
    score -= 20;
  }

  if (looksLikeWrongCountryGeneralNews(item, config)) {
    score -= 20;
  }

  if (isSwedishSource(`${item.source} ${item.title} ${item.link}`)) {
    score += 5;
  }

  const timestamp = Date.parse(item.pubDate || "");
  if (timestamp) {
    const ageDays = Math.floor(
      (Date.now() - timestamp) / (24 * 60 * 60 * 1000)
    );
    if (ageDays <= 2) score += 4;
    else if (ageDays <= 5) score += 2;
    else if (ageDays <= 10) score += 1;
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

    if (seen.has(key)) return false;
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
    .filter((item) => item.score >= 8)
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

  const footballTerms = uniq([...getBaseFootballTerms(), ...players]);

  return {
    slug: normalizedSlug,
    teamName,
    title: `Senaste om ${teamName}`,
    query: buildGoogleNewsQuery({
      teamName,
      aliases,
      players,
    }),
    includeTerms: uniq([teamName, ...aliases, ...players]),
    strongIncludeTerms: strongAliases,
    excludeTerms,
    strongExcludeTerms,
    footballTerms,
    maxItems: 5,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const config = getTeamNewsConfig(slug);

  const swedishUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
    config.query
  )}&hl=sv&gl=SE&ceid=SE:sv`;

  const englishUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
    config.query
  )}&hl=en&gl=US&ceid=US:en`;

  try {
    const [svRes, enRes] = await Promise.all([
      fetch(swedishUrl, {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "Mozilla/5.0 AddesVMTips/1.0",
        },
      }),
      fetch(englishUrl, {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "Mozilla/5.0 AddesVMTips/1.0",
        },
      }),
    ]);

    if (!svRes.ok && !enRes.ok) {
      return NextResponse.json(
        { error: "Kunde inte hämta nyheter", items: [], title: config.title },
        { status: 500 }
      );
    }

    const [svXml, enXml] = await Promise.all([
      svRes.ok ? svRes.text() : "",
      enRes.ok ? enRes.text() : "",
    ]);

    const svItems = svXml ? parseRssItems(svXml) : [];
    const enItems = enXml ? parseRssItems(enXml) : [];

    const allItems = [...svItems, ...enItems].sort(sortByDateDesc);
    const rankedItems = rankAndFilterItems(allItems, config);

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