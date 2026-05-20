"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, PlusCircle, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", label: "Strøm", icon: Home },
  { href: "/map", label: "Kart", icon: Map },
  { href: "/checkin", label: "Sjekk inn", icon: PlusCircle, highlight: true },
  { href: "/explore", label: "Utforsk", icon: Search },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 flex-1 py-1 transition-colors",
                highlight
                  ? "text-brand-500"
                  : active
                  ? "text-brand-600"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                size={highlight ? 32 : 22}
                strokeWidth={active || highlight ? 2.5 : 1.8}
              />
              <span className={cn("text-xs", highlight ? "font-semibold" : "")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
