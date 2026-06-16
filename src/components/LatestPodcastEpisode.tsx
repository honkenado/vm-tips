import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LatestPodcastEpisode() {
  const supabase = await createClient();

  const { data: episode } = await supabase
    .from("podcast_episodes")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (!episode) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
            🎙️ Senaste VM Tugg
          </p>
          <h2 className="mt-2 text-xl font-black text-white">
            {episode.title}
          </h2>
        </div>

        <Link
          href="/podcast"
          className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
        >
          Alla avsnitt
        </Link>
      </div>

      {episode.description && (
        <p className="mb-4 text-sm leading-relaxed text-slate-300">
          {episode.description}
        </p>
      )}

      <div
        className="overflow-hidden rounded-2xl bg-black/30"
        dangerouslySetInnerHTML={{ __html: episode.iframe_code }}
      />
    </section>
  );
}