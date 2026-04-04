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
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function TeamNews({ slug }: { slug: string }) {
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

        setItems((data.items ?? []).slice(0, 4));
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

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-black tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="text-sm text-slate-600">Relevanta nyheter om laget.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Kunde inte hämta nyheter just nu.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Inga relevanta nyheter hittades just nu.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <a
              key={`${item.link}-${index}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/60"
            >
              <p className="text-[15px] font-bold leading-6 text-slate-900">
                {item.title}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
                {item.source ? (
                  <span className="font-semibold text-slate-700">
                    {item.source}
                  </span>
                ) : null}

                {item.pubDate ? (
                  <span>{formatNewsDate(item.pubDate)}</span>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}