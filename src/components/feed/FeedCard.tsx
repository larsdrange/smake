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
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
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
              className="font-semibold text-sm text-gray-900 hover:underline truncate"
            >
              {item.display_name ?? item.username}
            </Link>
            {item.rating && (
              <StarRating value={item.rating} readonly size={12} />
            )}
          </div>
          <Link
            href={`/restaurants/${item.restaurant_id}`}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 transition-colors"
          >
            <MapPin size={10} />
            <span className="truncate">{item.restaurant_name}</span>
            {item.neighborhood_name && (
              <span className="text-gray-400">· {item.neighborhood_name}</span>
            )}
          </Link>
        </div>
        <time className="text-xs text-gray-400 shrink-0">
          {formatRelativeTime(item.created_at)}
        </time>
      </div>

      {/* Photo */}
      {item.photo_url && (
        <div className="relative aspect-square w-full bg-gray-100">
          <Image
            src={item.photo_url}
            alt={item.dish_name ?? `Food at ${item.restaurant_name}`}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
        </div>
      )}

      {/* Body */}
      <div className="p-3 space-y-2">
        {item.dish_name && (
          <p className="text-sm font-medium text-gray-800">{item.dish_name}</p>
        )}
        {item.review && (
          <p className="text-sm text-gray-600 leading-relaxed">{item.review}</p>
        )}

        {/* Cuisine tags */}
        {item.cuisine_types?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.cuisine_types.slice(0, 3).map((c) => (
              <span
                key={c}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {getCuisineEmoji(c)} {c}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-1 border-t border-gray-50">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <Heart
              size={18}
              className={liked ? "fill-red-500 text-red-500" : ""}
            />
            <span>{likeCount > 0 ? likeCount : ""}</span>
          </button>
          <Link
            href={`/restaurants/${item.restaurant_id}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
          >
            <MessageCircle size={18} />
            <span>Se restaurant</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
