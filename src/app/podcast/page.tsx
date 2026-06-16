import { createClient } from "../../../lib/supabase/server";

export default async function PodcastPage() {
  const supabase = await createClient();

  const { data: episodes } = await supabase
    .from("podcast_episodes")
    .select("id, title, description, iframe_code, published_at")
    .order("published_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
          🎙️ Addes VM-tips
        </p>

        <h1 className="mt-3 text-4xl font-black">VM Tugg</h1>

        <p className="mt-3 max-w-2xl text-slate-300">
          Reaktioner, haverier, genidrag och allt som händer i årets VM-tips.
        </p>

        <div className="mt-8 space-y-6">
          {episodes && episodes.length > 0 ? (
            episodes.map((episode: any) => (
              <article
                key={episode.id}
                className="rounded-3xl border border-white/10 bg-slate-950 p-5 shadow-xl"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  {new Date(episode.published_at).toLocaleDateString("sv-SE")}
                </p>

                <h2 className="mt-2 text-2xl font-black text-white">
                  {episode.title}
                </h2>

                {episode.description ? (
                  <p className="mb-4 mt-2 text-sm leading-relaxed text-slate-300">
                    {episode.description}
                  </p>
                ) : null}

                <div
                  className="overflow-hidden rounded-2xl bg-black/30"
                  dangerouslySetInnerHTML={{ __html: episode.iframe_code }}
                />
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300">
              Inga avsnitt publicerade ännu.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}