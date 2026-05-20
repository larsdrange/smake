import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, Globe, Star, Heart, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { FeedCard } from "@/components/feed/FeedCard";
import { getPriceLevelString, getCuisineEmoji } from "@/lib/utils";
import type { CheckInFeedItem, Restaurant } from "@/types/database";
import { FavoriteButton } from "@/components/restaurants/FavoriteButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*, neighborhood:neighborhoods(name)")
    .eq("id", id)
    .single();

  if (!restaurant) notFound();

  const r = restaurant as Restaurant & { neighborhood?: { name: string } };

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: checkIns }, { data: isFavorite }, { count: checkinCount }] = await Promise.all([
    supabase
      .from("check_in_feed")
      .select("*")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    user
      ? supabase
          .from("favorites")
          .select("restaurant_id")
          .eq("user_id", user.id)
          .eq("restaurant_id", id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("check_ins")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", id),
  ]);

  const avgRating =
    checkIns && checkIns.length > 0
      ? (
          checkIns.reduce((sum, c) => sum + (c.rating ?? 0), 0) /
          checkIns.filter((c) => c.rating).length
        ).toFixed(1)
      : null;

  return (
    <>
      <TopBar title={r.name} />
      <div className="px-4 pt-4 space-y-5 pb-4">
        {/* Header */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{r.name}</h1>
              {r.neighborhood?.name && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} />
                  {r.neighborhood.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {user && (
                <FavoriteButton
                  restaurantId={r.id}
                  userId={user.id}
                  initialFavorited={!!isFavorite}
                />
              )}
              <Link
                href={`/checkin?restaurant=${r.id}`}
                className="flex items-center gap-1.5 bg-brand-500 text-white text-xs font-semibold px-3 py-2 rounded-xl"
              >
                <PlusCircle size={14} />
                Sjekk inn
              </Link>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2">
            {r.cuisine_types?.map((c) => (
              <span
                key={c}
                className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium"
              >
                {getCuisineEmoji(c)} {c}
              </span>
            ))}
            {r.price_level !== null && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                {getPriceLevelString(r.price_level)}
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-50 pt-3">
            {avgRating && (
              <span className="flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {avgRating} snitt
              </span>
            )}
            <span>{checkinCount ?? 0} innsjekkinger</span>
            {r.google_rating && (
              <span className="flex items-center gap-1 text-gray-400">
                <Star size={12} />
                {r.google_rating} Google
              </span>
            )}
          </div>

          {/* Contact */}
          {(r.address || r.phone || r.website) && (
            <div className="space-y-1.5 border-t border-gray-50 pt-3">
              {r.address && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  {r.address}
                </p>
              )}
              {r.phone && (
                <a href={`tel:${r.phone}`} className="text-sm text-brand-600 flex items-center gap-2">
                  <Phone size={14} className="shrink-0" />
                  {r.phone}
                </a>
              )}
              {r.website && (
                <a
                  href={r.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-600 flex items-center gap-2"
                >
                  <Globe size={14} className="shrink-0" />
                  Nettside
                </a>
              )}
            </div>
          )}
        </div>

        {/* Check-in feed */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Siste innsjekkinger
          </h2>
          {checkIns && checkIns.length > 0 ? (
            <div className="space-y-4">
              {checkIns.map((ci) => (
                <FeedCard
                  key={ci.id}
                  item={ci as CheckInFeedItem}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-3">📸</p>
              <p className="text-sm">Ingen innsjekkinger ennå på denne restauranten</p>
              {user && (
                <Link href={`/checkin?restaurant=${r.id}`} className="mt-3 inline-block text-sm text-brand-600 font-medium">
                  Vær den første!
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
