"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function SeedRestaurantsButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSeed() {
    if (!confirm("Dette henter restauranter i Bergen fra Google Places API og legger til nye. Fortsette?")) return;
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/restaurants/seed", { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      setResult(`La til ${data.added} restauranter`);
    } else {
      setResult(`Error: ${data.error}`);
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
          {result}
        </span>
      )}
      <button
        onClick={handleSeed}
        disabled={loading}
        className="flex items-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        Hent fra Google
      </button>
    </div>
  );
}
