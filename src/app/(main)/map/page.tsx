import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { RestaurantMap } from "@/components/map/RestaurantMap";
import type { Restaurant } from "@/types/database";

export default async function MapPage() {
  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .limit(200);

  const { data: { user } } = await supabase.auth.getUser();

  let visitedIds = new Set<string>();
  if (user) {
    const { data: checkIns } = await supabase
      .from("check_ins")
      .select("restaurant_id")
      .eq("user_id", user.id);
    visitedIds = new Set(checkIns?.map((c) => c.restaurant_id));
  }

  return (
    <>
      <TopBar title="Bergenskart" />
      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {restaurants?.length ?? 0} restauranter i Bergen
          </p>
          {user && visitedIds.size > 0 && (
            <p className="text-sm text-brand-600 font-medium">
              {visitedIds.size} besøkt
            </p>
          )}
        </div>

        <RestaurantMap
          restaurants={(restaurants as Restaurant[]) ?? []}
          visitedIds={visitedIds}
          className="h-[calc(100vh-200px)]"
        />

        <div className="flex items-center gap-3 text-xs text-gray-500 pb-4">
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded-full bg-brand-500 text-white text-center leading-4 text-[10px]">✓</span>
            Besøkt
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded-full bg-white border border-gray-200 text-center text-[10px] leading-4">🍴</span>
            Ikke besøkt
          </span>
        </div>
      </div>
    </>
  );
}
