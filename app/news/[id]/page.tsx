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

function NewsHeroImage({
  imageUrl,
  title,
}: {
  imageUrl: string | null;
  title: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={title}
        className="max-h-[460px] w-full object-cover"
      />
    );
  }

  return (
    <div className="flex min-h-[280px] w-full items-center justify-center bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02))] md:min-h-[360px]">
      <img
        src="/logo.png"
        alt="Addes VM-tips"
        className="max-h-32 w-auto object-contain opacity-90"
      />
    </div>
  );
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
    <main className="min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/news"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            ← Tillbaka till nyheter
          </Link>
        </div>

        <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#020617] text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute -left-24 top-0 h-[220px] w-[220px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute right-[-60px] top-8 h-[180px] w-[180px] rounded-full bg-emerald-400/8 blur-[90px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.12),rgba(2,6,23,0)_35%,rgba(2,6,23,0)_65%,rgba(16,185,129,0.05))]" />

          <div className="relative border-b border-white/10">
            <NewsHeroImage imageUrl={post.image_url} title={post.title} />
          </div>

          <div className="relative p-6 md:p-8 lg:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-100">
                Artikel
              </span>
              <span className="text-sm text-white/45">
                {new Date(post.created_at).toLocaleString("sv-SE")}
              </span>
            </div>

            <h1 className="mb-6 text-3xl font-black tracking-tight text-white md:text-5xl">
              {post.title}
            </h1>

            <div className="whitespace-pre-line text-base leading-8 text-white/78 md:text-lg">
              {post.content}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}