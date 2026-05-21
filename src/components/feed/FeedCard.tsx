"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { formatRelativeTime, getCuisineEmoji } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { CheckInFeedItem } from "@/types/database";

interface FeedCardProps {
  item: CheckInFeedItem;
  currentUserId?: string;
}

export function FeedCard({ item, currentUserId }: FeedCardProps) {
  const [liked, setLiked] = useState(item.user_liked ?? false);
  const [likeCount, setLikeCount] = useState(Number(item.like_count));
  const supabase = createClient();

  async function toggleLike() {
    if (!currentUserId) return;

    if (liked) {
      await supabase
        .from("check_in_likes")
        .delete()
        .eq("user_id", currentUserId)
        .eq("check_in_id", item.id);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase
        .from("check_in_likes")
        .insert({ user_id: currentUserId, check_in_id: item.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  }

  return (
    <article className="glass rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Link href={`/profile/${item.username}`}>
          <Avatar
            src={item.avatar_url}
            alt={item.display_name ?? item.username}
            size={40}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/profile/${item.username}`}
              className="font-semibold text-sm text-white/90 hover:text-white transition-colors truncate"
            >
              {item.display_name ?? item.username}
            </Link>
            {item.rating && (
              <StarRating value={item.rating} readonly size={11} />
            )}
          </div>
          <Link
            href={`/restaurants/${item.restaurant_id}`}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-brand-400 transition-colors"
          >
            <MapPin size={10} />
            <span className="truncate">{item.restaurant_name}</span>
            {item.neighborhood_name && (
              <span className="text-white/25">· {item.neighborhood_name}</span>
            )}
          </Link>
        </div>
        <time className="text-xs text-white/25 shrink-0">
          {formatRelativeTime(item.created_at)}
        </time>
      </div>

      {/* Photo */}
      {item.photo_url && (
        <div className="relative aspect-square w-full bg-white/05">
          <Image
            src={item.photo_url}
            alt={item.dish_name ?? `Food at ${item.restaurant_name}`}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
          {item.dish_name && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-8 pb-3">
              <p className="text-sm font-semibold text-white">{item.dish_name}</p>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {!item.photo_url && item.dish_name && (
          <p className="text-sm font-semibold text-white/90">{item.dish_name}</p>
        )}
        {item.review && (
          <p className="text-sm text-white/55 leading-relaxed">{item.review}</p>
        )}

        {/* Cuisine tags */}
        {item.cuisine_types?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.cuisine_types.slice(0, 3).map((c) => (
              <span
                key={c}
                className="text-xs bg-white/06 text-white/50 border border-white/08 px-2.5 py-0.5 rounded-full"
              >
                {getCuisineEmoji(c)} {c}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-5 pt-1 border-t border-white/06">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1.5 text-sm transition-colors"
          >
            <Heart
              size={18}
              className={liked ? "fill-brand-500 text-brand-500" : "text-white/30 hover:text-white/60"}
            />
            <span className={liked ? "text-brand-500" : "text-white/30"}>
              {likeCount > 0 ? likeCount : ""}
            </span>
          </button>
          <Link
            href={`/restaurants/${item.restaurant_id}`}
            className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            <MessageCircle size={18} />
            <span>Se restaurant</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
