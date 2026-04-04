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

      return {
        title,
        link,
        pubDate,
        source,
      };
    })
    .filter((item) => item.title && item.link)
    .slice(0, 8);
}

function getTeamNewsConfig(slug: string) {
  const normalizedSlug = slug.toLowerCase();

  if (normalizedSlug === "mexiko") {
    return {
      title: "Senaste om Mexiko",
      query:
        '(Mexico national team OR Mexico football team OR Mexican national team OR "Selección de fútbol de México" OR "Santiago Gimenez" OR "Edson Alvarez")',
      hl: "en",
      gl: "US",
      ceid: "US:en",
    };
  }

  return null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const config = getTeamNewsConfig(slug);

  if (!config) {
    return NextResponse.json({ items: [], title: "" });
  }

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
    const items = parseRssItems(xml);

    return NextResponse.json({
      title: config.title,
      items,
    });
  } catch (error) {
    console.error("Team news fetch error:", error);

    return NextResponse.json(
      { error: "Kunde inte hämta nyheter", items: [], title: config.title },
      { status: 500 }
    );
  }
}