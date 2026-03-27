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

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-100 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <h1 className="text-3xl font-bold text-slate-900">Nyheter</h1>
          <p className="mt-2 text-sm text-slate-600">
            Senaste uppdateringarna kring VM-tipset.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Inga nyheter än.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.id}`}
                className="group block overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
              >
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="h-52 w-full object-cover transition group-hover:scale-[1.01]"
                  />
                ) : null}

                <div className="p-6">
                  <h2 className="mb-2 text-xl font-semibold text-slate-900">
                    {post.title}
                  </h2>

                  <p className="mb-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {truncate(post.content, 180)}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      {new Date(post.created_at).toLocaleString("sv-SE")}
                    </div>

                    <span className="text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800">
                      Läs mer →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}