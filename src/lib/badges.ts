import { createClient } from "@/lib/supabase/server";
import type { UserStats } from "@/types/database";

export async function checkAndAwardBadges(userId: string) {
  const supabase = await createClient();

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!stats) return;

  const { data: allBadges } = await supabase
    .from("badges")
    .select("*")
    .eq("is_active", true);

  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  const earnedIds = new Set(earnedBadges?.map((b) => b.badge_id) ?? []);
  const toAward: string[] = [];

  for (const badge of allBadges ?? []) {
    if (earnedIds.has(badge.id)) continue;

    const c = badge.criteria as Record<string, unknown>;

    if (badge.category === "visits") {
      if (c.check_ins && stats.total_check_ins >= Number(c.check_ins)) {
        toAward.push(badge.id);
      }
      if (c.unique_restaurants && stats.unique_restaurants >= Number(c.unique_restaurants)) {
        toAward.push(badge.id);
      }
    }

    if (badge.category === "explorer") {
      if (c.neighborhoods && stats.neighborhoods_visited >= Number(c.neighborhoods)) {
        toAward.push(badge.id);
      }
    }

    if (badge.category === "cuisine" && c.cuisine) {
      const cuisines = stats.cuisines_tried ?? [];
      if (cuisines.includes(c.cuisine as string)) {
        toAward.push(badge.id);
      }
    }
  }

  if (toAward.length > 0) {
    await supabase.from("user_badges").insert(
      toAward.map((badge_id) => ({ user_id: userId, badge_id }))
    );
  }
}
