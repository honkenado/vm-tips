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
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-100 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-emerald-200 bg-gradient-to-r from-emerald-900 via-green-900 to-slate-950 px-6 py-6 text-white md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Redaktion
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              VM-Tipset Nyheter
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
              Senaste nytt, uppdateringar och viktiga besked kring turneringen.
            </p>
          </div>

          <div className="bg-gradient-to-b from-white to-slate-50 px-6 py-4 md:px-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                VM-bulletin
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Senaste först
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Klicka för full artikel
              </span>
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Inga nyheter än.
          </div>
        ) : (
          <div className="space-y-8">
            {featuredPost ? (
              <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <Link
                  href={`/news/${featuredPost.id}`}
                  className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
                >
                  {featuredPost.image_url ? (
                    <div className="overflow-hidden">
                      <img
                        src={featuredPost.image_url}
                        alt={featuredPost.title}
                        className="h-64 w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-[380px]"
                      />
                    </div>
                  ) : null}

                  <div className="p-6 md:p-8">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        Huvudnyhet
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(featuredPost.created_at).toLocaleString("sv-SE")}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
                      {featuredPost.title}
                    </h2>

                    <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600">
                      {truncate(featuredPost.content, 320)}
                    </p>

                    <div className="mt-6 text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800">
                      Läs hela artikeln →
                    </div>
                  </div>
                </Link>

                <div className="grid gap-6">
                  {secondaryPosts.map((post, index) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.id}`}
                      className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
                    >
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : null}

                      <div className="p-5">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                            Toppnyhet {index + 2}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(post.created_at).toLocaleString("sv-SE")}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold leading-tight text-slate-900">
                          {post.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {truncate(post.content, 150)}
                        </p>

                        <div className="mt-4 text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800">
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
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Arkiv
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                      Fler nyheter
                    </h2>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {remainingPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.id}`}
                      className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
                    >
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : null}

                      <div className="p-5">
                        <div className="mb-3 text-xs text-slate-400">
                          {new Date(post.created_at).toLocaleString("sv-SE")}
                        </div>

                        <h3 className="text-lg font-bold leading-tight text-slate-900">
                          {post.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {truncate(post.content, 140)}
                        </p>

                        <div className="mt-4 text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800">
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