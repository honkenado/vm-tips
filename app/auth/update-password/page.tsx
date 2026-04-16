'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('Lösenordet måste vara minst 6 tecken.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Lösenorden matchar inte.');
      return;
    }

    setLoading(true);
const {
  data: { session },
} = await supabase.auth.getSession();

console.log('RESET SESSION', session);
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage('Lösenordet är uppdaterat. Du kan nu logga in.');
    setPassword('');
    setConfirmPassword('');
    setLoading(false);

    setTimeout(() => {
      router.push('/login');
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Välj nytt lösenord</h1>
        <p className="text-white/70 mb-6">Skriv in ditt nya lösenord nedan.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">Nytt lösenord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Bekräfta nytt lösenord</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-sm text-emerald-300">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white text-black font-semibold py-3 disabled:opacity-50"
          >
            {loading ? 'Sparar...' : 'Spara nytt lösenord'}
          </button>
        </form>
      </div>
    </main>
  );
}