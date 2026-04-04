"use client";

import { useEffect, useState } from "react";

type TeamNewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
};

function formatNewsDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function TeamNews({
  slug,
}: {
  slug: string;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TeamNewsItem[]>([]);
  const [title, setTitle] = useState("Senaste nytt");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNews() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/team-news/${slug}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Kunde inte hämta nyheter");
        }

        if (!isMounted) return;

        setItems(data.items ?? []);
        setTitle(data.title || "Senaste nytt");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Något gick fel");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    loadNews();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3">
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Senaste nytt
          </h2>
          <p className="text-sm text-slate-600">Laddar nyheter...</p>
        </div>
      </section>
    );
  }

  if (error || items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="text-xl font-black tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="text-sm text-slate-600">
          Automatiskt nyhetsflöde från externa källor.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <a
            key={`${item.link}-${index}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <p className="text-sm font-black text-slate-900">{item.title}</p>

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              {item.source ? (
                <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600">
                  {item.source}
                </span>
              ) : null}

              {item.pubDate ? (
                <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600">
                  {formatNewsDate(item.pubDate)}
                </span>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}