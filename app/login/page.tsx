'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Logga in</h1>
        <p className="text-white/70 mb-6">Logga in för att fortsätta med ditt VM-tips.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Lösenord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white text-black font-semibold py-3 disabled:opacity-50"
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>
      </div>
    </main>
  );
}