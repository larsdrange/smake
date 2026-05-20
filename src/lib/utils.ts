import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Akkurat nå";
  if (diffMins < 60) return `for ${diffMins} min siden`;
  if (diffHours < 24) return `for ${diffHours} t siden`;
  if (diffDays < 7) return `for ${diffDays} d siden`;
  return date.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export function getDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getPriceLevelString(level: number | null): string {
  if (level === null) return "";
  return "kr".repeat(level + 1);
}

export function getCuisineEmoji(cuisine: string): string {
  const map: Record<string, string> = {
    Japanese: "🍣",
    Sushi: "🍣",
    Italian: "🍕",
    Pizza: "🍕",
    Seafood: "🦞",
    Norwegian: "🐟",
    Burger: "🍔",
    American: "🍔",
    Mexican: "🌮",
    Indian: "🍛",
    Chinese: "🥡",
    Thai: "🍜",
    Vietnamese: "🍜",
    Mediterranean: "🫒",
    Turkish: "🥙",
    Kebab: "🥙",
    Cafe: "☕",
    Bakery: "🥐",
    Dessert: "🍰",
    Bar: "🍺",
    Pub: "🍺",
  };
  return map[cuisine] ?? "🍴";
}

export function getSupabasePublicUrl(
  supabaseUrl: string,
  bucket: string,
  path: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
