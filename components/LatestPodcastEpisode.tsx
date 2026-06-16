import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LatestPodcastEpisode() {
  const supabase = await createClient();

  const { data: episode } = await supabase
    .from("podcast_episodes")
    .select("id, title, description, iframe_code, published_at, is_featured")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!episode) return null;

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-300">
            🎙️ Senaste VM Tugg
          </p>
          <h2 className="mt-2 text-xl font-black text-white">
            {episode.title}
          </h2>
        </div>

        <Link
          href="/podcast"
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white transition hover:bg-white/[0.1]"
        >
          Alla avsnitt
        </Link>
      </div>

      {episode.description ? (
        <p className="mb-4 text-sm leading-relaxed text-white/78">
          {episode.description}
        </p>
      ) : null}

      <div
        className="overflow-hidden rounded-2xl bg-black/30"
        dangerouslySetInnerHTML={{ __html: episode.iframe_code }}
      />
    </section>
  );
}