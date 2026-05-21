import Link from "next/link";
import { Settings } from "lucide-react";

interface TopBarProps {
  title?: string;
  rightElement?: React.ReactNode;
  showSettings?: boolean;
}

export function TopBar({ title = "Smake", rightElement, showSettings }: TopBarProps) {
  return (
    <header className="sticky top-0 bg-[rgba(10,10,10,0.92)] backdrop-blur-xl border-b border-white/[0.06] z-30">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <Link
          href="/feed"
          className="font-bold text-xl tracking-tight bg-brand-gradient bg-clip-text text-transparent"
        >
          {title}
        </Link>
        <div className="flex items-center gap-2">
          {rightElement}
          {showSettings && (
            <Link href="/settings" className="p-2 text-white/40 hover:text-white/70 transition-colors">
              <Settings size={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
