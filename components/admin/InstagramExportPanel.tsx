"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import InstagramNewsCard from "./InstagramNewsCard";
import { buildInstagramCaption } from "@/lib/social";

type Props = {
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  id?: string | null;
};

export default function InstagramExportPanel({
  title,
  excerpt,
  imageUrl,
  id,
}: Props) {
  const postRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const [isDownloadingPost, setIsDownloadingPost] = useState(false);
  const [isDownloadingStory, setIsDownloadingStory] = useState(false);
  const [isCopyingCaption, setIsCopyingCaption] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const safeTitle = title.trim() || "Rubrik saknas";
  const safeExcerpt = excerpt?.trim() || "Kort text saknas";

  const caption = useMemo(() => {
    return buildInstagramCaption({
      title: safeTitle,
      excerpt: safeExcerpt,
      id,
    });
  }, [safeTitle, safeExcerpt, id]);

  async function waitForImages(container: HTMLElement) {
    const images = Array.from(container.querySelectorAll("img"));

    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        });
      })
    );
  }

  async function downloadImage(
    ref: React.RefObject<HTMLDivElement | null>,
    filename: string,
    kind: "post" | "story"
  ) {
    if (!ref.current) return;

    setErrorMessage(null);
    setStatusMessage(null);

    if (kind === "post") {
      setIsDownloadingPost(true);
    } else {
      setIsDownloadingStory(true);
    }

    try {
      await waitForImages(ref.current);
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#020617",
        includeQueryParams: true,
      });

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setStatusMessage(
        kind === "post"
          ? "Instagram-post nedladdad."
          : "Instagram-story nedladdad."
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Kunde inte skapa bilden. Kontrollera att bilden hunnit laddas klart och testa igen."
      );
    } finally {
      if (kind === "post") {
        setIsDownloadingPost(false);
      } else {
        setIsDownloadingStory(false);
      }
    }
  }

  async function copyCaption() {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsCopyingCaption(true);

    try {
      await navigator.clipboard.writeText(caption);
      setStatusMessage("Caption kopierad.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Kunde inte kopiera caption.");
    } finally {
      setIsCopyingCaption(false);
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(16,185,129,0.08),rgba(255,255,255,1))] px-5 py-4">
        <h3 className="text-lg font-black text-slate-900">Instagram-export</h3>
        <p className="mt-1 text-sm text-slate-600">
          Skapa en färdig bild för inlägg eller story och kopiera caption direkt.
        </p>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadImage(postRef, "instagram-post.png", "post")}
            disabled={isDownloadingPost}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloadingPost ? "Skapar post..." : "Ladda ner post"}
          </button>

          <button
            type="button"
            onClick={() =>
              downloadImage(storyRef, "instagram-story.png", "story")
            }
            disabled={isDownloadingStory}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloadingStory ? "Skapar story..." : "Ladda ner story"}
          </button>

          <button
            type="button"
            onClick={copyCaption}
            disabled={isCopyingCaption}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCopyingCaption ? "Kopierar..." : "Kopiera caption"}
          </button>
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {statusMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 2xl:grid-cols-[260px_minmax(0,1fr)]">
          <div>
            <div className="mb-3">
              <div className="text-sm font-semibold text-slate-900">
                Förhandsvisning
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Så här ungefär ser post-layouten ut.
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 shadow-sm">
              <div
                className="origin-top-left scale-[0.2]"
                style={{ width: 1080, height: 270 }}
              >
                <InstagramNewsCard
                  title={safeTitle}
                  excerpt={safeExcerpt}
                  imageUrl={imageUrl}
                  variant="post"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">
                Caption
              </div>
              <div className="mt-2 whitespace-pre-line rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                {caption}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Info</div>

              <div className="mt-2 space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">Post:</span>{" "}
                  1080 × 1350
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Story:</span>{" "}
                  1080 × 1920
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Länk:</span>{" "}
                  {id ? `addesvmtips.se/news/${id}` : "addesvmtips.se"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "fixed",
            left: "-99999px",
            top: 0,
            pointerEvents: "none",
            opacity: 0,
            width: 0,
            height: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ contain: "strict" }}>
            <div ref={postRef}>
              <InstagramNewsCard
                title={safeTitle}
                excerpt={safeExcerpt}
                imageUrl={imageUrl}
                variant="post"
              />
            </div>

            <div ref={storyRef}>
              <InstagramNewsCard
                title={safeTitle}
                excerpt={safeExcerpt}
                imageUrl={imageUrl}
                variant="story"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}