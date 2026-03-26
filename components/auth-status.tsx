'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type UserInfo = {
  email?: string;
} | null;

export default function AuthStatus() {
  const supabase = createClient();

  const [user, setUser] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user ? { email: user.email } : null);
      setLoading(false);
    }

    getUser();
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
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/80">{user.email}</span>
      <button
        onClick={handleLogout}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
      >
        Logga ut
      </button>
    </div>
  );
}