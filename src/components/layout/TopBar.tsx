import Link from "next/link";
import { Settings } from "lucide-react";

interface TopBarProps {
  title?: string;
  rightElement?: React.ReactNode;
  showSettings?: boolean;
}

export function TopBar({ title = "Smake", rightElement, showSettings }: TopBarProps) {
  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-30">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <Link href="/feed" className="font-bold text-xl text-brand-600 tracking-tight">
          {title}
        </Link>
        <div className="flex items-center gap-2">
          {rightElement}
          {showSettings && (
            <Link href="/settings" className="p-2 text-gray-500 hover:text-gray-700">
              <Settings size={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
