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
    <div className="grid grid-cols-4 divide-x divide-gray-100 bg-white rounded-2xl border border-gray-100 shadow-sm">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center py-4 px-1">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-xs text-gray-500 mt-0.5 text-center">{label}</span>
        </div>
      ))}
    </div>
  );
}
