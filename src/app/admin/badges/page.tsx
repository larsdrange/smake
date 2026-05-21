import { createClient } from "@/lib/supabase/server";
import type { Badge } from "@/types/database";

export default async function AdminBadgesPage() {
  const supabase = await createClient();
  const { data: badges } = await supabase
    .from("badges")
    .select("*")
    .order("category")
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Merker</h1>

      <div className="grid grid-cols-2 gap-4">
        {badges?.map((badge: Badge) => (
          <div
            key={badge.id}
            className={`bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-4 ${
              badge.is_active ? "border-gray-100" : "border-dashed border-gray-200 opacity-60"
            }`}
          >
            <span className="text-3xl">{badge.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{badge.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
              <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                {badge.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
