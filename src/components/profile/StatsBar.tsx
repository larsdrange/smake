import type { UserStats } from "@/types/database";

interface StatsBarProps {
  stats: UserStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: "Innsjekkinger", value: stats.total_check_ins },
    { label: "Restauranter", value: stats.unique_restaurants },
    { label: "Bydeler", value: stats.neighborhoods_visited },
    { label: "Kjøkken", value: stats.cuisines_tried?.length ?? 0 },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-white/06 glass rounded-2xl">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center py-4 px-1">
          <span className="text-2xl font-bold text-white/90">{value}</span>
          <span className="text-xs text-white/35 mt-0.5 text-center leading-tight">{label}</span>
        </div>
      ))}
    </div>
  );
}
