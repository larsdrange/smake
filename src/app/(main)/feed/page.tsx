"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { FeedList } from "@/components/feed/FeedList";
import { createClient } from "@/lib/supabase/client";
import type { CheckInFeedItem } from "@/types/database";
import { Bell } from "lucide-react";

type Tab = "bergen" | "nearby";

export default function FeedPage() {
  const [tab, setTab] = useState<Tab>("bergen");
  const [items, setItems] = useState<CheckInFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  useEffect(() => {
    loadFeed();
  }, [tab, userPos]);

  async function loadFeed() {
    setLoading(true);

    let query = supabase
      .from("check_in_feed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (tab === "nearby" && userPos) {
      const R = 2;
      const latD = R / 111;
      const lngD = R / (111 * Math.cos((userPos.lat * Math.PI) / 180));
      query = query
        .gte("latitude", userPos.lat - latD)
        .lte("latitude", userPos.lat + latD)
        .gte("longitude", userPos.lng - lngD)
        .lte("longitude", userPos.lng + lngD);
    }

    const { data } = await query;
    setItems((data as CheckInFeedItem[]) ?? []);
    setLoading(false);
  }

  function requestLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }

  function switchTab(t: Tab) {
    setTab(t);
    if (t === "nearby" && !userPos) requestLocation();
  }

  return (
    <>
      <TopBar
        rightElement={
          <Link href="/notifications" className="p-2 text-gray-500">
            <Bell size={20} />
          </Link>
        }
      />
      <div className="px-4 pt-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
          {(["bergen", "nearby"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "bergen" ? "Bergen" : "I nærheten"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-28" />
                    <div className="h-2 bg-gray-100 rounded w-40" />
                  </div>
                </div>
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <FeedList
            initialItems={items}
            currentUserId={userId}
            nearbyMode={tab === "nearby"}
            userLat={userPos?.lat}
            userLng={userPos?.lng}
          />
        )}
      </div>
    </>
  );
}
