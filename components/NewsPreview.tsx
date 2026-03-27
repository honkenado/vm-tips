"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NewsPost = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export default function NewsPreview() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadNews() {
      try {
        const res = await fetch("/api/news", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Kunde inte hämta nyheter");
        }

        if (isMounted) {
          setPosts((data.posts ?? []).slice(0, 3));
        }
      } catch (error) {
        console.error("Kunde inte läsa nyheter:", error);
        if (isMounted) {
          setPosts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="mx-auto mb-8 max-w-7xl px-4 md:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
            Senaste nytt
          </h2>
          <p className="mt-2 text-sm text-slate-500">Laddar nyheter...</p>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mb-4 sm:mb-6 md:mb-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-5 py-4 md:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                Kommunikation
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                Senaste nytt
              </h2>
            </div>

            <Link
              href="/news"
              className="hidden rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25 md:inline-flex"
            >
              Alla nyheter
            </Link>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm"
              >
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="h-40 w-full object-cover"
                  />
                ) : null}

                <div className="p-5">
                  <div className="mb-3 text-xs font-medium text-slate-400">
                    {new Date(post.created_at).toLocaleString("sv-SE")}
                  </div>

                  <h3 className="mb-2 text-lg font-semibold leading-tight text-slate-900">
                    {post.title}
                  </h3>

                  <p className="text-sm leading-6 text-slate-600">
                    {truncate(post.content, 140)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 md:hidden">
            <Link
              href="/news"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Alla nyheter
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}