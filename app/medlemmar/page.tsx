import MembersSection from "@/components/MembersSection";

export default function MembersPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-6 rounded-[1.75rem] bg-gradient-to-r from-emerald-600 to-green-500 p-5 text-white shadow-sm sm:p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">
          Addes VM-tips
        </p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Medlemmar</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
          Här ser du alla användare som har skapat konto i appen.
        </p>
      </div>

      <MembersSection />
    </main>
  );
}