import Link from "next/link";
import { headers } from "next/headers";

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

async function getNews(): Promise<NewsPost[]> {
  const headersList = await headers();
  const host = headersList.get("host");

  if (!host) {
    throw new Error("Kunde inte avgöra host");
  }

  const protocol = host.includes("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/news`, {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Kunde inte hämta nyheter");
  }

  return data.posts ?? [];
}

export default async function NewsPage() {
  const posts = await getNews();

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);
  const remainingPosts = posts.slice(3);

  return (
    <main className="min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="card-premium-strong mb-8 overflow-hidden">
          <div className="relative border-b border-white/10 px-6 py-6 md:px-8">
            <div className="pointer-events-none absolute -left-20 top-0 h-[220px] w-[220px] rounded-full bg-emerald-500/10 blur-[90px]" />
            <div className="pointer-events-none absolute right-[-50px] top-4 h-[180px] w-[180px] rounded-full bg-emerald-400/8 blur-[80px]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.14),rgba(2,6,23,0)_35%,rgba(2,6,23,0)_65%,rgba(16,185,129,0.06))]" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
                Redaktion
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                VM-Tipset Nyheter
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 md:text-base">
                Senaste nytt, uppdateringar och viktiga besked kring turneringen.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 md:px-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-white/60">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-1 text-emerald-100">
                VM-bulletin
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                Senaste först
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                Klicka för full artikel
              </span>
            </div>
          </div>
        </section>

        {posts.length === 0 ? (
          <div className="card-premium rounded-2xl px-4 py-8 text-center text-sm text-white/70">
            Inga nyheter än.
          </div>
        ) : (
          <div className="space-y-8">
            {featuredPost ? (
              <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <Link
                  href={`/news/${featuredPost.id}`}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  {featuredPost.image_url ? (
                    <div className="overflow-hidden">
                      <img
                        src={featuredPost.image_url}
                        alt={featuredPost.title}
                        className="h-64 w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-[380px]"
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-white/[0.03] text-sm text-white/45 md:h-[380px]">
                      Ingen bild
                    </div>
                  )}

                  <div className="p-6 md:p-8">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-100">
                        Huvudnyhet
                      </span>
                      <span className="text-xs text-white/45">
                        {new Date(featuredPost.created_at).toLocaleString("sv-SE")}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black tracking-tight text-white md:text-4xl">
                      {featuredPost.title}
                    </h2>

                    <p className="mt-4 whitespace-pre-line text-base leading-8 text-white/74">
                      {truncate(featuredPost.content, 320)}
                    </p>

                    <div className="mt-6 text-sm font-semibold text-emerald-300 transition group-hover:text-emerald-200">
                      Läs hela artikeln →
                    </div>
                  </div>
                </Link>

                <div className="grid gap-6">
                  {secondaryPosts.map((post, index) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.id}`}
                      className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-[0_12px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
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
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold text-white/70">
                            Toppnyhet {index + 2}
                          </span>
                          <span className="text-xs text-white/45">
                            {new Date(post.created_at).toLocaleString("sv-SE")}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold leading-tight text-white">
                          {post.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-white/72">
                          {truncate(post.content, 150)}
                        </p>

                        <div className="mt-4 text-sm font-semibold text-emerald-300 transition group-hover:text-emerald-200">
                          Läs mer →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {remainingPosts.length > 0 ? (
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                      Arkiv
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                      Fler nyheter
                    </h2>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {remainingPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.id}`}
                      className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
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
                        <div className="mb-3 text-xs text-white/45">
                          {new Date(post.created_at).toLocaleString("sv-SE")}
                        </div>

                        <h3 className="text-lg font-bold leading-tight text-white">
                          {post.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-white/72">
                          {truncate(post.content, 140)}
                        </p>

                        <div className="mt-4 text-sm font-semibold text-emerald-300 transition group-hover:text-emerald-200">
                          Läs mer →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}