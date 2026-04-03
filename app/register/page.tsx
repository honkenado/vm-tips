"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [referralFromUrl, setReferralFromUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    setReferralFromUrl(ref ? ref.trim().toUpperCase() : null);
  }, []);

  async function createUniqueReferralCode() {
    for (let i = 0; i < 10; i += 1) {
      const code = generateReferralCode();

      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", code)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        return code;
      }
    }

    throw new Error("Kunde inte skapa unik värvningskod. Försök igen.");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const referralCode = await createUniqueReferralCode();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      const user = data.user;

      if (user) {
        const referredBy =
          referralFromUrl && referralFromUrl !== referralCode
            ? referralFromUrl
            : null;

        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          username: username.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          referral_code: referralCode,
          referred_by: referredBy,
        });

        if (profileError) {
          setErrorMessage(profileError.message);
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      router.push("/login");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Något gick fel"
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold">Skapa konto</h1>
        <p className="mb-6 text-white/70">
          Registrera dig för att spara ditt VM-tips.
        </p>

        {referralFromUrl && (
          <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Du registrerar dig via en värvningslänk.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">Förnamn</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Efternamn</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Mobilnummer</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Användarnamn</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
            />
          </div>

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

          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Skapar konto..." : "Skapa konto"}
          </button>
        </form>
      </div>
    </main>
  );
}