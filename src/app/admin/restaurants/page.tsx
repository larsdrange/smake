import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { RestaurantAdminTable } from "@/components/admin/RestaurantAdminTable";
import { SeedRestaurantsButton } from "@/components/admin/SeedRestaurantsButton";

export default async function AdminRestaurantsPage() {
  const supabase = await createClient();

  const { data: restaurants, count } = await supabase
    .from("restaurants")
    .select("*, neighborhood:neighborhoods(name)", { count: "exact" })
    .order("name")
    .limit(100);

  const { data: neighborhoods } = await supabase
    .from("neighborhoods")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restauranter</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count ?? 0} totalt</p>
        </div>
        <div className="flex items-center gap-2">
          <SeedRestaurantsButton />
          <Link
            href="/admin/restaurants/new"
            className="flex items-center gap-1.5 bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Legg til restaurant
          </Link>
        </div>
      </div>

      <RestaurantAdminTable
        restaurants={restaurants ?? []}
        neighborhoods={neighborhoods ?? []}
      />
    </div>
  );
}
