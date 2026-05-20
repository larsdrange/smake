import type { UserBadge } from "@/types/database";

interface BadgeGridProps {
  badges: UserBadge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Ingen merker ennå — begynn å sjekke inn!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((ub) => (
        <div
          key={ub.id}
          className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-center"
          title={ub.badge?.description ?? ""}
        >
          <span className="text-3xl">{ub.badge?.icon}</span>
          <span className="text-xs font-semibold text-gray-700 leading-tight">
            {ub.badge?.name}
          </span>
        </div>
      ))}
    </div>
  );
}
