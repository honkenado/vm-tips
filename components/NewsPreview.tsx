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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNews() {
      try {
        setErrorMessage(null);

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
          setErrorMessage(
            error instanceof Error ? error.message : "Okänt fel vid hämtning av nyheter"
          );
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
      <section className="relative overflow-hidden rounded-[2rem] border border-white/6 bg-[#020617] text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.10),rgba(2,6,23,0.0)_35%,rgba(2,6,23,0.0)_65%,rgba(16,185,129,0.06))]" />
        <div className="relative border-b border-white/10 px-6 py-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-400/90">
            Kommunikation
          </p>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
            Senaste nytt
          </h2>
        </div>
        <div className="relative p-6">
          <p className="text-sm text-white/70">Laddar nyheter...</p>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-red-400/20 bg-[#020617] text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="relative border-b border-white/10 px-6 py-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-400/90">
            Kommunikation
          </p>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
            Senaste nytt
          </h2>
        </div>
        <div className="relative p-6">
          <p className="text-sm text-red-200">
            Kunde inte läsa nyheter: {errorMessage}
          </p>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-white/6 bg-[#020617] text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.10),rgba(2,6,23,0.0)_35%,rgba(2,6,23,0.0)_65%,rgba(16,185,129,0.06))]" />
        <div className="relative border-b border-white/10 px-6 py-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-400/90">
            Kommunikation
          </p>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
            Senaste nytt
          </h2>
        </div>
        <div className="relative p-6">
          <p className="text-sm text-white/70">Inga publicerade nyheter än.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/6 bg-[#020617] text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute -left-24 top-0 h-[220px] w-[220px] rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-60px] top-8 h-[180px] w-[180px] rounded-full bg-emerald-400/8 blur-[90px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.16),rgba(2,6,23,0.0)_35%,rgba(2,6,23,0.0)_65%,rgba(16,185,129,0.08))]" />

      <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-400/90">
            Kommunikation
          </p>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
            Senaste nytt
          </h2>
        </div>

        <Link
          href="/news"
          className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08]"
        >
          Alla nyheter
        </Link>
      </div>

      <div className="relative p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.id}`}
              className="group block overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(234,179,8,0.25)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
            >
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-white/[0.03] text-sm text-white/45">
                  Ingen bild
                </div>
              )}

              <div className="p-5">
                <div className="mb-3 text-xs font-medium text-white/45">
                  {new Date(post.created_at).toLocaleString("sv-SE")}
                </div>

                <h3 className="mb-2 text-lg font-black leading-tight text-white">
                  {post.title}
                </h3>

                <p className="text-sm leading-6 text-white/72">
                  {truncate(post.content, 140)}
                </p>

                <div className="mt-4 inline-flex items-center text-sm font-bold text-emerald-300 transition group-hover:text-emerald-200">
                  Läs mer →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-5 md:hidden">
          <Link
            href="/news"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            Alla nyheter
          </Link>
        </div>
      </div>
    </section>
  );
}