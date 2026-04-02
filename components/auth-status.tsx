"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserInfo = {
  id: string;
  email?: string;
} | null;

type Profile = {
  payment_code: string | null;
  payment_status: "paid" | "unpaid";
  is_admin: boolean | null;
} | null;

function shortenEmail(email?: string) {
  if (!email) return "";
  if (email.length <= 24) return email;
  return `${email.slice(0, 18)}...`;
}

export default function AuthStatus() {
  const supabase = createClient();

  const [user, setUser] = useState<UserInfo>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserAndProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({ id: user.id, email: user.email });

        const { data: profileData } = await supabase
          .from("profiles")
          .select("payment_code, payment_status, is_admin")
          .eq("id", user.id)
          .single();

        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    }

    getUserAndProfile();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (loading) {
    return <div className="text-xs text-white/70">Kollar inloggning...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-wrap gap-2">
        <a
          href="/login"
          className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white transition hover:bg-white/10"
        >
          Logga in
        </a>
        <a
          href="/register"
          className="h-9 rounded-xl bg-white px-3 py-2 text-[13px] font-semibold text-black transition hover:opacity-90"
        >
          Skapa konto
        </a>
      </div>
    );
  }

  const isUnpaid = profile?.payment_status === "unpaid";

  return (
    <div className="flex w-full flex-col gap-2 lg:items-end">
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-white/80 lg:justify-end">
        <p className="max-w-[220px] truncate" title={user.email}>
          {shortenEmail(user.email)}
        </p>

        {profile && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
            <span className="font-semibold text-white">
              {profile.payment_code ?? "—"}
            </span>

            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                profile.payment_status === "paid"
                  ? "bg-green-500/20 text-green-300"
                  : "bg-yellow-500/20 text-yellow-300"
              }`}
            >
              {profile.payment_status === "paid" ? "Betald" : "Ej betald"}
            </span>
          </div>
        )}
      </div>

      {profile && isUnpaid && (
        <div className="max-w-[360px] rounded-xl border border-yellow-400/20 bg-yellow-500/10 px-3 py-2 text-[12px] leading-5 text-yellow-200 lg:text-right">
          Swisha <span className="font-bold text-white">170 kr</span> till{" "}
          <span className="font-bold text-white">070-3222546</span>
          {profile.payment_code ? (
            <>
              {" "}
              och märk med kod <span className="font-bold text-white">{profile.payment_code}</span>
            </>
          ) : null}
          .
        </div>
      )}

      <div className="flex flex-wrap gap-2 lg:justify-end">
        {profile?.is_admin && (
          <a
            href="/admin"
            className="h-9 rounded-xl bg-blue-600 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-500"
          >
            Admin
          </a>
        )}

        <button
          onClick={handleLogout}
          className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white transition hover:bg-white/10"
        >
          Logga ut
        </button>
      </div>
    </div>
  );
}