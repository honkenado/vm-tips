"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type ChatReaction = {
  emoji: string;
  count: number;
  user_ids: string[];
};

type ChatMessage = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  reactions: ChatReaction[];
};

const REACTION_OPTIONS = ["👍", "🔥", "😂", "❤️"];

function getDisplayName(message: ChatMessage) {
  const fullName = `${message.first_name ?? ""} ${message.last_name ?? ""}`.trim();
  return fullName || message.username || "Okänd användare";
}

function formatTime(dateString: string) {
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return "";
  }
}

export default function GlobalChat({
  isLoggedIn,
  isAdmin = false,
  currentUserId = null,
}: {
  isLoggedIn: boolean;
  isAdmin?: boolean;
  currentUserId?: string | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reactingKey, setReactingKey] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedInitiallyRef = useRef(false);

  const lastMessageId = useMemo(
    () => messages[messages.length - 1]?.id ?? null,
    [messages]
  );

  async function loadMessages({ silent = false }: { silent?: boolean } = {}) {
    try {
      if (!silent) {
        setLoading(true);
      }

      const res = await fetch("/api/chat/global", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Kunde inte hämta chatten.");
        return;
      }

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setErrorMessage(null);
    } catch (error) {
      console.error("Fel vid hämtning av global chat", error);
      if (!silent) {
        setErrorMessage("Kunde inte hämta chatten.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) return;

    const supabase = createClient(url, anonKey);

    const channel = supabase
      .channel("global-chat-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          loadMessages({ silent: true });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_message_reactions",
        },
        () => {
          loadMessages({ silent: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadMessages({ silent: true });
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!listRef.current || !lastMessageId) return;

    if (!hasLoadedInitiallyRef.current) {
      hasLoadedInitiallyRef.current = true;
      return;
    }

    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lastMessageId]);

  async function handleSendMessage() {
    const trimmed = message.trim();

    if (!trimmed || sending) return;

    try {
      setSending(true);
      setErrorMessage(null);

      const res = await fetch("/api/chat/global", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Kunde inte skicka meddelandet.");
        return;
      }

      setMessage("");
      await loadMessages({ silent: true });
    } catch (error) {
      console.error("Fel vid skickande av global chat", error);
      setErrorMessage("Kunde inte skicka meddelandet.");
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteMessage(messageId: string) {
    const target = messages.find((item) => item.id === messageId);
    const isOwner = target?.user_id === currentUserId;
    const canDelete = isAdmin || isOwner;

    if (!canDelete || !messageId || deletingId) return;

    const confirmed = window.confirm(
      "Är du säker på att du vill radera detta meddelande?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(messageId);
      setErrorMessage(null);

      const res = await fetch("/api/chat/global", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Delete failed:", data);
        setErrorMessage(data.error || "Kunde inte radera meddelandet.");
        return;
      }

      setMessages((prev) => prev.filter((item) => item.id !== messageId));
    } catch (error) {
      console.error("Fel vid radering av chatmeddelande", error);
      setErrorMessage("Kunde inte radera meddelandet.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleReaction(messageId: string, emoji: string) {
    if (!isLoggedIn) return;

    const key = `${messageId}-${emoji}`;

    try {
      setReactingKey(key);
      setErrorMessage(null);

      const res = await fetch("/api/chat/global/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId, emoji }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Kunde inte uppdatera reaction.");
        return;
      }

      await loadMessages({ silent: true });
    } catch (error) {
      console.error("Fel vid reaction:", error);
      setErrorMessage("Kunde inte uppdatera reaction.");
    } finally {
      setReactingKey(null);
    }
  }

  function hasReacted(item: ChatMessage, emoji: string) {
    const reaction = item.reactions?.find((entry) => entry.emoji === emoji);
    if (!reaction || !currentUserId) return false;
    return reaction.user_ids.includes(currentUserId);
  }

  function getReactionCount(item: ChatMessage, emoji: string) {
    return item.reactions?.find((entry) => entry.emoji === emoji)?.count ?? 0;
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.04] p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_35%,transparent_100%)]" />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-400/90">
              Community
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-white md:text-2xl">
              Snack
            </h2>
            <p className="mt-1 text-sm text-white/68">
              Skriv, peppa och snacka VM med andra deltagare.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/70">
            {messages.length} meddelanden
          </div>
        </div>

        <div
          ref={listRef}
          className="h-[300px] overflow-y-auto rounded-[1.5rem] border border-white/8 bg-[#020617]/50 p-3 md:h-[320px]"
        >
          <div className="space-y-2">
            {loading ? (
              <div className="text-sm text-white/70">Laddar chatten...</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-white/65">
                Inga meddelanden ännu. Bli först att skriva något ⚽
              </div>
            ) : (
              messages.map((item) => {
                const isOwner = item.user_id === currentUserId;
                const canDelete = isAdmin || isOwner;

                return (
                 <div
  key={item.id}
  className="border-b border-white/8 py-2 last:border-b-0"
>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {getDisplayName(item)}
                          </span>
                          <span className="text-xs text-white/40">
                            {formatTime(item.created_at)}
                          </span>
                        </div>

                        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-5 text-white/85">
                          {item.message}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {REACTION_OPTIONS.map((emoji) => {
                            const count = getReactionCount(item, emoji);
                            const active = hasReacted(item, emoji);
                            const key = `${item.id}-${emoji}`;

                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleReaction(item.id, emoji)}
                                disabled={!isLoggedIn || reactingKey === key}
                                className={`rounded-full border px-2.5 py-1 text-xs font-bold transition ${
                                  active
                                    ? "border-emerald-400/25 bg-emerald-500/12 text-emerald-100"
                                    : "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                {emoji} {count > 0 ? count : ""}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(item.id)}
                          disabled={deletingId === item.id}
                          className="shrink-0 rounded-full border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === item.id ? "..." : "Radera"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-3 rounded-[1.5rem] border border-white/8 bg-[#020617]/60 p-3">
          {isLoggedIn ? (
            <>
              <label htmlFor="global-chat-message" className="sr-only">
                Skriv ett meddelande
              </label>

              <textarea
                id="global-chat-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Skriv något till alla deltagare..."
                maxLength={400}
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:outline-none"
              />

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-white/45">
                  {message.trim().length}/400 tecken
                </div>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-500/95 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(16,185,129,0.28)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Skickar..." : "Skicka meddelande"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-sm text-white/75">
              Du behöver vara inloggad för att skriva i chatten.
            </div>
          )}

          {errorMessage ? (
            <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {errorMessage}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}