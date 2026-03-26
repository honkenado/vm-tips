'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type UserInfo = {
  id: string;
  email?: string;
} | null;

type Profile = {
  payment_code: string | null;
  payment_status: 'paid' | 'unpaid';
  is_admin: boolean | null;
} | null;

function shortenEmail(email?: string) {
  if (!email) return '';
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
          .from('profiles')
          .select('payment_code, payment_status, is_admin')
          .eq('id', user.id)
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
    return <div className="text-sm text-white/70">Kollar inloggning...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <a
          href="/login"
          className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        >
          Logga in
        </a>
        <a
          href="/register"
          className="min-h-11 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Skapa konto
        </a>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p
            className="truncate text-sm text-white/80"
            title={user.email}
          >
            {shortenEmail(user.email)}
          </p>
        </div>

        {profile && (
          <div className="flex w-fit max-w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <span className="truncate font-semibold text-white">
              {profile.payment_code ?? '—'}
            </span>

            <span
              className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${
                profile.payment_status === 'paid'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}
            >
              {profile.payment_status === 'paid' ? 'Betald' : 'Ej betald'}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {profile?.is_admin && (
          <a
            href="/admin"
            className="min-h-11 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Admin
          </a>
        )}

        <button
          onClick={handleLogout}
          className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        >
          Logga ut
        </button>
      </div>
    </div>
  );
}