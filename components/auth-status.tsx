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
    return <div className="text-white/70">Kollar inloggning...</div>;
  }

  if (!user) {
    return (
      <div className="flex gap-3">
        <a
          href="/login"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
        >
          Logga in
        </a>
        <a
          href="/register"
          className="rounded-xl bg-white px-4 py-2 font-semibold text-black"
        >
          Skapa konto
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-white/80">{user.email}</span>

      {profile && (
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <span className="font-semibold text-white">
            {profile.payment_code}
          </span>

          <span
            className={`rounded-full px-2 py-1 text-xs ${
              profile.payment_status === 'paid'
                ? 'bg-green-500/20 text-green-300'
                : 'bg-yellow-500/20 text-yellow-300'
            }`}
          >
            {profile.payment_status === 'paid' ? 'Betald' : 'Ej betald'}
          </span>
        </div>
      )}

      {profile?.is_admin && (
        <a
          href="/admin"
          className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500"
        >
          Admin
        </a>
      )}

      <button
        onClick={handleLogout}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
      >
        Logga ut
      </button>
    </div>
  );
}