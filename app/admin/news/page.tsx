"use client";

import { useEffect, useState } from "react";
import InstagramExportPanel from "@/components/admin/InstagramExportPanel";

type NewsPost = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  is_published?: boolean;
};

export default function AdminNewsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  async function loadPosts() {
    try {
      setLoadingPosts(true);

      const res = await fetch("/api/news", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kunde inte hämta nyheter");
      }

      setPosts(data.posts ?? []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Kunde inte hämta nyheter");
    } finally {
      setLoadingPosts(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  function resetForm() {
    setTitle("");
    setContent("");
    setImageUrl("");
    setEditingPostId(null);
  }

  function startEditing(post: NewsPost) {
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.image_url ?? "");
    setEditingPostId(post.id);
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      if (editingPostId) {
        const res = await fetch(`/api/news/${editingPostId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            image_url: imageUrl,
            is_published: true,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Kunde inte uppdatera nyheten");
        }

        setPosts((prev) =>
          prev.map((post) =>
            post.id === editingPostId ? { ...post, ...data.post } : post
          )
        );

        setMessage("Nyheten uppdaterades.");
        resetForm();
        return;
      }

      const res = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          image_url: imageUrl,
          is_published: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kunde inte skapa nyheten");
      }

      setMessage("Nyheten publicerades.");
      resetForm();
      await loadPosts();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(postId: string) {
    const confirmed = window.confirm("Vill du verkligen radera nyheten?");
    if (!confirmed) return;

    setDeletingId(postId);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/news/${postId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kunde inte radera nyheten");
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));

      if (editingPostId === postId) {
        resetForm();
      }

      setMessage("Nyheten raderades.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setDeletingId(null);
    }
  }

  const previewExcerpt =
    content.trim().length > 180
      ? `${content.trim().slice(0, 180)}...`
      : content.trim();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Admin – nyheter</h1>
          <p className="mt-2 text-slate-600">
            Skriv, uppdatera och radera nyheter.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingPostId ? "Redigera nyhet" : "Skriv nyhet"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {editingPostId
                  ? "Ändra innehållet och spara uppdateringen."
                  : "Lägg upp en ny uppdatering för deltagarna."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Titel
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Skriv rubrik här"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Innehåll
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Skriv nyheten här..."
                  rows={10}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="imageUrl"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Bild-URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {message ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? editingPostId
                      ? "Sparar..."
                      : "Publicerar..."
                    : editingPostId
                    ? "Spara ändringar"
                    : "Publicera nyhet"}
                </button>

                {editingPostId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Avbryt
                  </button>
                ) : null}
              </div>
            </form>

            {(title.trim() || content.trim() || imageUrl.trim()) && (
              <InstagramExportPanel
                title={title || "Rubrik saknas"}
                excerpt={previewExcerpt || "Kort text saknas"}
                imageUrl={imageUrl || null}
                id={editingPostId}
              />
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Befintliga nyheter</h2>
              <p className="mt-1 text-sm text-slate-500">
                Senaste nyheterna visas överst.
              </p>
            </div>

            {loadingPosts ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Hämtar nyheter...
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Inga nyheter ännu.
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm"
                  >
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="h-40 w-full object-cover"
                      />
                    ) : null}

                    <div className="p-5">
                      <div className="mb-2 text-xs text-slate-400">
                        {new Date(post.created_at).toLocaleString("sv-SE")}
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900">
                        {post.title}
                      </h3>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {post.content}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => startEditing(post)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
                        >
                          Redigera
                        </button>

                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === post.id ? "Raderar..." : "Radera"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}