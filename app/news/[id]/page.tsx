import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

type NewsPost = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

async function getNewsPost(id: string): Promise<NewsPost | null> {
  const headersList = await headers();
  const host = headersList.get("host");

  if (!host) {
    throw new Error("Kunde inte avgöra host");
  }

  const protocol = host.includes("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/news/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Kunde inte hämta nyheten");
  }

  return data.post ?? null;
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getNewsPost(id);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-100 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/news"
          className="mb-6 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Tillbaka till nyheter
        </Link>

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="max-h-[420px] w-full object-cover"
            />
          ) : null}

          <div className="p-6 md:p-8">
            <div className="mb-3 text-sm text-slate-400">
              {new Date(post.created_at).toLocaleString("sv-SE")}
            </div>

            <h1 className="mb-6 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              {post.title}
            </h1>

            <div className="whitespace-pre-line text-base leading-8 text-slate-700">
              {post.content}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}