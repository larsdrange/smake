"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, X, MapPin, Utensils, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StarRating } from "@/components/ui/StarRating";
import { createClient } from "@/lib/supabase/client";
import { checkAndAwardBadgesClient } from "@/lib/badges-client";
import type { Restaurant } from "@/types/database";

export function CheckInForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [dishName, setDishName] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [restaurantResults, setRestaurantResults] = useState<Restaurant[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"restaurant" | "photo" | "details">("restaurant");

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  const searchRestaurants = useCallback(async (query: string) => {
    if (query.length < 2) {
      setRestaurantResults([]);
      return;
    }
    setSearching(true);
    const { data } = await supabase
      .from("restaurants")
      .select("*, neighborhood:neighborhoods(name)")
      .ilike("name", `%${query}%`)
      .eq("is_active", true)
      .limit(6);
    setRestaurantResults((data as Restaurant[]) ?? []);
    setSearching(false);
  }, [supabase]);

  function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setRestaurantSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchRestaurants(val), 300);
  }

  function selectRestaurant(r: Restaurant) {
    setSelectedRestaurant(r);
    setRestaurantSearch(r.name);
    setRestaurantResults([]);
    setStep("photo");
  }

  async function getNearbyRestaurant() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const { data } = await supabase.rpc("get_nearby_restaurants", {
        lat,
        lng,
        radius_km: 0.3,
        lim: 5,
      });
      if (data && data.length > 0) {
        setRestaurantResults(data as Restaurant[]);
      }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRestaurant) {
      setError("Velg en restaurant.");
      return;
    }
    if (!photo) {
      setError("Legg til et bilde av maten din.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Upload photo
      const ext = photo.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("check-in-photos")
        .upload(path, photo, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("check-in-photos")
        .getPublicUrl(path);

      // Get current location
      let lat: number | null = null;
      let lng: number | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {}

      // Insert check-in
      const { data: checkIn, error: insertError } = await supabase
        .from("check_ins")
        .insert({
          user_id: userId,
          restaurant_id: selectedRestaurant.id,
          photo_url: urlData.publicUrl,
          review: review || null,
          rating: rating || null,
          dish_name: dishName || null,
          latitude: lat,
          longitude: lng,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Award badges (non-blocking)
      fetch("/api/badges/check", { method: "POST" }).catch(() => {});

      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {/* Step indicator */}
      <div className="flex gap-2 items-center px-1">
        {(["restaurant", "photo", "details"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s
                  ? "bg-brand-500 text-white"
                  : i < ["restaurant", "photo", "details"].indexOf(step)
                  ? "bg-brand-200 text-brand-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 rounded" />}
          </div>
        ))}
      </div>

      {/* Step 1: Restaurant */}
      {step === "restaurant" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Hvor spiser du?</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={restaurantSearch}
              onChange={onSearchChange}
              placeholder="Søk restauranter..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50"
            />
            {searching && (
              <div className="absolute right-3 top-3 w-4 h-4 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
            )}
          </div>

          {restaurantResults.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm divide-y divide-gray-50">
              {restaurantResults.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectRestaurant(r)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-brand-50 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <Utensils size={14} className="text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                    <p className="text-xs text-gray-500 truncate">{r.address}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={getNearbyRestaurant}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-brand-600 border border-brand-200 rounded-xl hover:bg-brand-50 transition-colors"
          >
            <MapPin size={14} />
            Finn restauranter i nærheten
          </button>
        </div>
      )}

      {/* Step 2: Photo */}
      {step === "photo" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Legg til bilde</h2>
            <button
              type="button"
              onClick={() => setStep("restaurant")}
              className="text-sm text-brand-600"
            >
              Bytt restaurant
            </button>
          </div>

          <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl">
            <MapPin size={14} className="text-brand-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{selectedRestaurant?.name}</p>
              <p className="text-xs text-gray-500">{selectedRestaurant?.address}</p>
            </div>
          </div>

          {photoPreview ? (
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image src={photoPreview} alt="Food photo" fill className="object-cover" />
              <button
                type="button"
                onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 hover:border-brand-300 hover:bg-brand-50 transition-colors"
            >
              <Camera size={36} className="text-gray-300" />
              <span className="text-sm text-gray-500">Trykk for å legge til bilde</span>
              <span className="text-xs text-gray-400">Vis oss hva du spiser!</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPhotoChange}
            className="hidden"
          />

          <Button
            type="button"
            className="w-full"
            disabled={!photoPreview}
            onClick={() => setStep("details")}
          >
            Fortsett
          </Button>
        </div>
      )}

      {/* Step 3: Details */}
      {step === "details" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Fortell oss mer</h2>

          {photoPreview && (
            <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100">
              <Image src={photoPreview} alt="Food photo" fill className="object-cover" />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Din vurdering</label>
            <StarRating value={rating} onChange={setRating} size={28} />
          </div>

          <Input
            label="Hva spiste du?"
            placeholder="f.eks. Fiskesuppe, Burger, Sushi..."
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Omtale (valgfritt)</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Hvordan var det? Tips til andre?"
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 resize-none placeholder:text-gray-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            Del innsjekk
          </Button>
        </div>
      )}
    </form>
  );
}
