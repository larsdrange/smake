import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Settings, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { StatsBar } from "@/components/profile/StatsBar";
import { BadgeGrid } from "@/components/profile/BadgeGrid";
import { RestaurantMap } from "@/components/map/RestaurantMap";
import type { Profile, UserStats, UserBadge, CheckIn, Restaurant } from "@/types/database";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const isOwn = currentUser?.id === profile.id;

  const [
    { data: statsData },
    { data: badges },
    { data: checkIns },
    { data: favorites },
  ] = await Promise.all([
    supabase.from("user_stats").select("*").eq("user_id", profile.id).single(),
    supabase
      .from("user_badges")
      .select("*, badge:badges(*)")
      .eq("user_id", profile.id)
      .order("awarded_at", { ascending: false }),
    supabase
      .from("check_ins")
      .select("*, restaurant:restaurants(id, name, latitude, longitude, cuisine_types)")
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("favorites")
      .select("*, restaurant:restaurants(*)")
      .eq("user_id", profile.id)
      .limit(5),
  ]);

  const stats = statsData as UserStats | null;
  const visitedRestaurants = checkIns
    ?.map((ci) => ci.restaurant as Restaurant)
    .filter(Boolean) ?? [];
  const visitedIds = new Set(visitedRestaurants.map((r) => r.id));

  return (
    <>
      <TopBar
        title={`@${profile.username}`}
        rightElement={
          isOwn ? (
            <Link href="/settings" className="p-2 text-white/40 hover:text-white/70 transition-colors">
              <Settings size={20} />
            </Link>
          ) : null
        }
      />

      <div className="px-4 pt-4 space-y-5 pb-4">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatar_url}
            alt={profile.display_name ?? profile.username}
            size={72}
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white/90">
              {profile.display_name ?? profile.username}
            </h1>
            <p className="text-sm text-white/40">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm text-white/55 mt-1">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && <StatsBar stats={stats} />}

        {/* Badges */}
        {badges && badges.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white/50 mb-2">
              Merker ({badges.length})
            </h2>
            <BadgeGrid badges={badges as UserBadge[]} />
          </section>
        )}

        {/* Visited map */}
        {visitedRestaurants.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white/50 mb-2">
              Steder besøkt
            </h2>
            <RestaurantMap
              restaurants={visitedRestaurants}
              visitedIds={visitedIds}
              className="h-52"
            />
          </section>
        )}

        {/* Check-in grid */}
        {checkIns && checkIns.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white/50 mb-2">
              Siste innsjekkinger
            </h2>
            <div className="grid grid-cols-3 gap-1">
              {checkIns.map((ci) => (
                <Link key={ci.id} href={`/restaurants/${ci.restaurant_id}`}>
                  <div className="aspect-square relative bg-white/05 rounded-lg overflow-hidden">
                    {ci.photo_url ? (
                      <Image
                        src={ci.photo_url}
                        alt="Food"
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍴
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Favorites */}
        {favorites && favorites.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white/50 mb-2 flex items-center gap-1">
              <Heart size={14} className="text-brand-500 fill-brand-500" />
              Favoritter
            </h2>
            <div className="space-y-2">
              {favorites.map((fav) => {
                const r = fav.restaurant as Restaurant;
                return r ? (
                  <Link
                    key={fav.restaurant_id}
                    href={`/restaurants/${r.id}`}
                    className="flex items-center gap-3 p-3.5 glass rounded-2xl hover:bg-white/08 transition-colors"
                  >
                    <MapPin size={14} className="text-brand-500 shrink-0" />
                    <span className="text-sm text-white/80 font-medium">{r.name}</span>
                    <span className="text-xs text-white/30 ml-auto">{r.address}</span>
                  </Link>
                ) : null;
              })}
            </div>
          </section>
        )}

        {checkIns?.length === 0 && (
          <div className="text-center py-12 text-white/25">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-sm">Ingen innsjekkinger ennå</p>
            {isOwn && (
              <Link href="/checkin" className="mt-3 inline-block text-sm text-brand-400 font-semibold">
                Gjør din første innsjekk
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
