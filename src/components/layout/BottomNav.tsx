"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Plus, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", label: "Strøm", icon: Home },
  { href: "/map", label: "Kart", icon: Map },
  { href: "/checkin", label: "Sjekk inn", icon: Plus, highlight: true },
  { href: "/explore", label: "Utforsk", icon: Search },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border-t border-white/[0.06] pb-safe z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname.startsWith(href);

          if (highlight) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 flex-1"
              >
                <div
                  className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center shadow-brand-glow -mt-5"
                >
                  <Icon size={22} strokeWidth={2.5} className="text-white" />
                </div>
                <span className="text-[10px] font-semibold text-brand-500 mt-0.5">{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 flex-1 py-1 transition-colors",
                active ? "text-brand-500" : "text-white/30 hover:text-white/60"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
