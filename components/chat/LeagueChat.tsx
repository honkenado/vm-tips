"use client";

import { useEffect, useRef, useState } from "react";

export default function LeagueChat({
  leagueId,
  isLoggedIn,
}: {
  leagueId: string;
  isLoggedIn: boolean;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  async function loadMessages() {
    const res = await fetch(`/api/chat/league/${leagueId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [leagueId]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send() {
    if (!message.trim()) return;

    setSending(true);

    const res = await fetch(`/api/chat/league/${leagueId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    if (data.message) {
      setMessages((prev) => [...prev, data.message]);
    }

    setMessage("");
    setSending(false);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <h3 className="mb-3 font-bold text-white">Ligachat</h3>

      <div
        ref={listRef}
        className="h-[320px] overflow-y-auto space-y-2"
      >
        {messages.map((m) => (
          <div key={m.id} className="text-sm text-white/80">
            <b>
              {m.first_name} {m.last_name}
            </b>
            : {m.message}
          </div>
        ))}
      </div>

      {isLoggedIn && (
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="mt-3 w-full rounded-xl bg-white/[0.05] p-2 text-white"
        />
      )}
    </div>
  );
}