import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

const BERGEN_COORDS = { lat: 60.3913, lng: 5.3221 };
const SEARCH_RADIUS = 5000; // meters

// Bergen neighborhood bounding boxes (rough)
function guessNeighborhoodByCoords(lat: number, lng: number): string | null {
  if (lat > 60.408) return "sandviken";
  if (lat < 60.375) return "fana";
  if (lng < 5.31) return "nordnes";
  if (lng > 5.36) return "nygard";
  if (lat > 60.397) return "bergenhus";
  if (lat > 60.39) return "bryggen";
  return "sentrum";
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
  }

  const adminSupabase = await createAdminClient();

  // Get existing google_place_ids to avoid duplicates
  const { data: existing } = await adminSupabase
    .from("restaurants")
    .select("google_place_id")
    .not("google_place_id", "is", null);
  const existingIds = new Set(existing?.map((r) => r.google_place_id));

  // Fetch neighborhood IDs
  const { data: neighborhoods } = await adminSupabase.from("neighborhoods").select("id, slug");
  const neighborhoodBySlug = new Map(neighborhoods?.map((n) => [n.slug, n.id]));

  let added = 0;
  let pageToken: string | undefined;

  // Paginate through Google Places results
  do {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${BERGEN_COORDS.lat},${BERGEN_COORDS.lng}`);
    url.searchParams.set("radius", String(SEARCH_RADIUS));
    url.searchParams.set("type", "restaurant");
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pagetoken", pageToken);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json({ error: `Google API error: ${data.status}` }, { status: 500 });
    }

    const places = data.results ?? [];
    const toInsert = [];

    for (const place of places) {
      if (existingIds.has(place.place_id)) continue;

      const lat = place.geometry.location.lat;
      const lng = place.geometry.location.lng;
      const neighborhoodSlug = guessNeighborhoodByCoords(lat, lng);
      const neighborhoodId = neighborhoodSlug
        ? neighborhoodBySlug.get(neighborhoodSlug) ?? null
        : null;

      // Map Google types to cuisine labels
      const cuisines: string[] = [];
      for (const t of place.types ?? []) {
        if (t === "japanese_restaurant") cuisines.push("Japanese");
        else if (t === "italian_restaurant" || t === "pizza_restaurant") cuisines.push("Italian");
        else if (t === "seafood_restaurant") cuisines.push("Seafood");
        else if (t === "hamburger_restaurant") cuisines.push("Burger");
        else if (t === "mexican_restaurant") cuisines.push("Mexican");
        else if (t === "chinese_restaurant") cuisines.push("Chinese");
        else if (t === "thai_restaurant") cuisines.push("Thai");
        else if (t === "indian_restaurant") cuisines.push("Indian");
        else if (t === "cafe") cuisines.push("Cafe");
        else if (t === "bar") cuisines.push("Bar");
      }

      toInsert.push({
        google_place_id: place.place_id,
        name: place.name,
        address: place.vicinity,
        latitude: lat,
        longitude: lng,
        neighborhood_id: neighborhoodId,
        cuisine_types: cuisines,
        google_rating: place.rating ?? null,
        price_level: place.price_level ?? null,
        photo_reference: place.photos?.[0]?.photo_reference ?? null,
        is_active: true,
      });

      existingIds.add(place.place_id);
    }

    if (toInsert.length > 0) {
      const { error } = await adminSupabase.from("restaurants").insert(toInsert);
      if (!error) added += toInsert.length;
    }

    pageToken = data.next_page_token;
    if (pageToken) await new Promise((r) => setTimeout(r, 2000)); // Google requires delay
  } while (pageToken);

  return NextResponse.json({ added });
}
