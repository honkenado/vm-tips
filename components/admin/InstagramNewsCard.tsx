"use client";

import { useEffect, useState } from "react";

type Props = {
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  variant?: "post" | "story";
};

export default function InstagramNewsCard({
  title,
  excerpt,
  imageUrl,
  variant = "post",
}: Props) {
  const isStory = variant === "story";
  const [safeImageSrc, setSafeImageSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadImageAsDataUrl(url: string) {
      try {
        const res = await fetch(url, {
          mode: "cors",
          credentials: "omit",
        });

        if (!res.ok) {
          throw new Error("Kunde inte hämta bilden");
        }

        const blob = await res.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled) {
            setSafeImageSrc(
              typeof reader.result === "string" ? reader.result : null
            );
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Kunde inte läsa bild för export:", error);
        if (!cancelled) {
          setSafeImageSrc(null);
        }
      }
    }

    setSafeImageSrc(null);

    if (!imageUrl) {
      return;
    }

    if (imageUrl.startsWith("data:")) {
      setSafeImageSrc(imageUrl);
      return;
    }

    loadImageAsDataUrl(imageUrl);

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return (
    <div
      style={{
        width: 1080,
        height: isStory ? 1920 : 1350,
      }}
      className="relative overflow-hidden bg-[#020617] text-white"
    >
      <div className="absolute inset-0 bg-[#020617]" />

      <div className="pointer-events-none absolute -left-20 top-0 h-[260px] w-[260px] rounded-full bg-emerald-500/12 blur-[60px]" />
      <div className="pointer-events-none absolute right-[-40px] top-20 h-[220px] w-[220px] rounded-full bg-cyan-400/8 blur-[50px]" />
      <div className="pointer-events-none absolute bottom-[-80px] left-1/2 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-emerald-400/8 blur-[60px]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.07),rgba(2,6,23,0)_35%,rgba(2,6,23,0)_65%,rgba(34,211,238,0.04))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%)]" />

      <div className="relative flex h-full flex-col p-14">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Nyhet
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/65">
            addesvmtips.se
          </div>
        </div>

        <div className={isStory ? "mt-12" : "mt-10"}>
          <h1
            className={
              isStory
                ? "max-w-[900px] text-[88px] font-black leading-[0.95] tracking-[-0.03em] text-white"
                : "max-w-[920px] text-[78px] font-black leading-[0.98] tracking-[-0.03em] text-white"
            }
          >
            {title}
          </h1>

          {excerpt ? (
            <p
              className={
                isStory
                  ? "mt-7 max-w-[860px] text-[34px] leading-[1.4] text-white/78"
                  : "mt-6 max-w-[860px] text-[30px] leading-[1.45] text-white/74"
              }
            >
              {excerpt}
            </p>
          ) : null}
        </div>

        <div className={isStory ? "mt-12" : "mt-10"}>
          <div className="relative overflow-hidden rounded-[42px] border border-white/10 bg-white/[0.04] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            {safeImageSrc ? (
              <img
                src={safeImageSrc}
                alt={title}
                className={
                  isStory
                    ? "h-[760px] w-full object-cover"
                    : "h-[560px] w-full object-cover"
                }
              />
            ) : (
              <div
                className={
                  isStory
                    ? "flex h-[760px] w-full items-center justify-center bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02))]"
                    : "flex h-[560px] w-full items-center justify-center bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02))]"
                }
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <img
                    src="/logo.png"
                    alt="Addes VM-tips"
                    className="mb-6 h-28 w-auto object-contain opacity-90"
                  />
                  <div className="text-3xl font-semibold text-white/75">
                    Addes VM-tips
                  </div>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-6 pt-10">
          <div className="max-w-[720px]">
            <div className="text-[22px] font-semibold uppercase tracking-[0.28em] text-white/45">
              Fotboll • VM-tips • Nyheter
            </div>
            <div className="mt-3 text-[28px] font-medium leading-relaxed text-white/78">
              Läs mer på addesvmtips.se
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-6 py-4 text-right">
            <div className="text-[20px] font-semibold text-white/85">
              Addes VM-tips
            </div>
            <div className="mt-1 text-[18px] text-white/55">
              Nyhetsuppdatering
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}