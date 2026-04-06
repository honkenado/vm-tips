"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  // ❌ Visa inte på tips-sidan
  if (pathname.startsWith("/tips")) return null;

  const items = [
    { href: "/", label: "Start", icon: "🏠" },
    { href: "/league", label: "Ligor", icon: "🏆" },
    { href: "/varva", label: "Värva", icon: "🚀" },
    { href: "/tv-guide", label: "TV", icon: "📺" },
    { href: "/lag", label: "Lag", icon: "⚽" },
    { href: "/help", label: "Hjälp", icon: "❓" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#020617]/95 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-[520px] items-stretch justify-around px-2 py-2.5">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                active
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-white/80 hover:bg-white/[0.05]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}