"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { FeedCard } from "./FeedCard";
import type { CheckInFeedItem } from "@/types/database";

interface FeedListProps {
  initialItems: CheckInFeedItem[];
  currentUserId?: string;
  nearbyMode?: boolean;
  userLat?: number;
  userLng?: number;
}

const PAGE_SIZE = 10;

export function FeedList({
  initialItems,
  currentUserId,
  nearbyMode,
  userLat,
  userLng,
}: FeedListProps) {
  const [items, setItems] = useState<CheckInFeedItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
  const [offset, setOffset] = useState(initialItems.length);
  const loaderRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    let query = supabase
      .from("check_in_feed")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (nearbyMode && userLat && userLng) {
      // Filter client-side by distance (simple bounding box for now)
      const R = 2; // km
      const latDelta = R / 111;
      const lngDelta = R / (111 * Math.cos((userLat * Math.PI) / 180));
      query = query
        .gte("latitude", userLat - latDelta)
        .lte("latitude", userLat + latDelta)
        .gte("longitude", userLng - lngDelta)
        .lte("longitude", userLng + lngDelta);
    }

    const { data } = await query;

    if (!data || data.length < PAGE_SIZE) setHasMore(false);
    if (data && data.length > 0) {
      // Enrich with user like status
      const enriched = await enrichWithLikes(data as CheckInFeedItem[], currentUserId);
      setItems((prev) => [...prev, ...enriched]);
      setOffset((prev) => prev + data.length);
    }
    setLoading(false);
  }, [loading, hasMore, offset, nearbyMode, userLat, userLng, currentUserId, supabase]);

  async function enrichWithLikes(
    items: CheckInFeedItem[],
    userId?: string
  ): Promise<CheckInFeedItem[]> {
    if (!userId) return items;
    const { data: likes } = await supabase
      .from("check_in_likes")
      .select("check_in_id")
      .eq("user_id", userId)
      .in("check_in_id", items.map((i) => i.id));
    const likedSet = new Set(likes?.map((l) => l.check_in_id));
    return items.map((i) => ({ ...i, user_liked: likedSet.has(i.id) }));
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-8">
        <div className="text-5xl mb-4">🍽️</div>
        <p className="text-gray-700 font-semibold text-lg">Ingen innsjekkinger ennå</p>
        <p className="text-gray-400 text-sm mt-1">
          {nearbyMode
            ? "Ingen har sjekket inn i nærheten. Vær den første!"
            : "Vær den første til å sjekke inn!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} currentUserId={currentUserId} />
      ))}
      <div ref={loaderRef} className="py-4 flex justify-center">
        {loading && (
          <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
