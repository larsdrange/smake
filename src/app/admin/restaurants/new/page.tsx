"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NewRestaurantPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lat || !lng) { setError("Breddegrad og lengdegrad er påkrevd."); return; }

    setSaving(true);
    const { error: insertErr } = await supabase.from("restaurants").insert({
      name,
      address: address || null,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      cuisine_types: cuisine ? cuisine.split(",").map((s) => s.trim()).filter(Boolean) : [],
      phone: phone || null,
      website: website || null,
      is_active: true,
    });

    if (insertErr) { setError(insertErr.message); setSaving(false); return; }
    router.push("/admin/restaurants");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/restaurants" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Legg til restaurant</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <Input label="Restaurantnavn *" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Bryggen 1, Bergen" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Breddegrad *" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="60.3913" type="number" step="any" required />
          <Input label="Lengdegrad *" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="5.3221" type="number" step="any" required />
        </div>
        <Input label="Kjøkkentyper (kommaseparert)" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="Norsk, Sjømat" />
        <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+47 55 00 00 00" />
        <Input label="Nettside" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." type="url" />

        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}

        <Button type="submit" className="w-full" loading={saving}>
          Legg til restaurant
        </Button>
      </form>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        <strong>Tips:</strong> For å finne koordinater til en adresse, søk på{" "}
        <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline">
          openstreetmap.org
        </a>{" "}
        og høyreklikk på stedet.
      </div>
    </div>
  );
}
