"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FavoriteButtonProps {
  restaurantId: string;
  userId: string;
  initialFavorited: boolean;
}

export function FavoriteButton({ restaurantId, userId, initialFavorited }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const supabase = createClient();

  async function toggle() {
    if (favorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("restaurant_id", restaurantId);
    } else {
      await supabase.from("favorites").insert({ user_id: userId, restaurant_id: restaurantId });
    }
    setFavorited(!favorited);
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl border border-white/10 hover:border-brand-500/40 transition-colors"
      aria-label={favorited ? "Fjern fra favoritter" : "Legg til favoritter"}
    >
      <Heart
        size={18}
        className={favorited ? "fill-brand-500 text-brand-500" : "text-white/30"}
      />
    </button>
  );
}
