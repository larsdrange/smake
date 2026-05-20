"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Utensils } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { createClient } from "@/lib/supabase/client";
import { getPriceLevelString, getCuisineEmoji } from "@/lib/utils";
import type { Restaurant, Neighborhood } from "@/types/database";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("neighborhoods").select("*").order("name").then(({ data }) => {
      setNeighborhoods((data as Neighborhood[]) ?? []);
    });
    loadRestaurants();
  }, []);

  useEffect(() => {
    const t = setTimeout(loadRestaurants, 300);
    return () => clearTimeout(t);
  }, [query, selectedNeighborhood]);

  async function loadRestaurants() {
    setLoading(true);
    let q = supabase
      .from("restaurants")
      .select("*, neighborhood:neighborhoods(name)")
      .eq("is_active", true)
      .order("name")
      .limit(40);

    if (query.length >= 2) q = q.ilike("name", `%${query}%`);
    if (selectedNeighborhood) q = q.eq("neighborhood_id", selectedNeighborhood);

    const { data } = await q;
    setRestaurants((data as Restaurant[]) ?? []);
    setLoading(false);
  }

  return (
    <>
      <TopBar title="Utforsk" />
      <div className="px-4 pt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk restauranter..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 bg-white"
          />
        </div>

        {/* Neighborhood filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedNeighborhood(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedNeighborhood
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {neighborhoods.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNeighborhood(n.id === selectedNeighborhood ? null : n.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedNeighborhood === n.id
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-3 animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-32" />
                  <div className="h-2 bg-gray-100 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {restaurants.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Utensils size={32} className="mx-auto mb-3 opacity-40" />
                <p>Ingen restauranter funnet</p>
              </div>
            ) : (
              restaurants.map((r) => (
                <Link
                  key={r.id}
                  href={`/restaurants/${r.id}`}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-brand-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 text-xl">
                    {r.cuisine_types?.[0] ? getCuisineEmoji(r.cuisine_types[0]) : "🍴"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {(r as Restaurant & { neighborhood?: { name: string } }).neighborhood?.name && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          <MapPin size={10} />
                          {(r as Restaurant & { neighborhood?: { name: string } }).neighborhood?.name}
                        </span>
                      )}
                      {r.cuisine_types?.length > 0 && (
                        <span className="text-xs text-gray-400">
                          · {r.cuisine_types.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  {r.price_level !== null && (
                    <span className="text-xs text-gray-400 shrink-0">
                      {getPriceLevelString(r.price_level)}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
