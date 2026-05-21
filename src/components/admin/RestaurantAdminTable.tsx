"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant, Neighborhood } from "@/types/database";

interface Props {
  restaurants: (Restaurant & { neighborhood?: { name: string } })[];
  neighborhoods: Neighborhood[];
}

export function RestaurantAdminTable({ restaurants: initial, neighborhoods }: Props) {
  const [restaurants, setRestaurants] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Restaurant>>({});
  const supabase = createClient();

  function startEdit(r: Restaurant) {
    setEditingId(r.id);
    setEditData({
      name: r.name,
      address: r.address ?? "",
      neighborhood_id: r.neighborhood_id ?? "",
      cuisine_types: r.cuisine_types,
      is_active: r.is_active,
    });
  }

  async function saveEdit(id: string) {
    const { data, error } = await supabase
      .from("restaurants")
      .update({
        name: editData.name,
        address: editData.address || null,
        neighborhood_id: editData.neighborhood_id || null,
        cuisine_types: editData.cuisine_types,
        is_active: editData.is_active,
      })
      .eq("id", id)
      .select("*, neighborhood:neighborhoods(name)")
      .single();

    if (!error && data) {
      setRestaurants((prev) => prev.map((r) => (r.id === id ? data as typeof r : r)));
    }
    setEditingId(null);
  }

  async function deleteRestaurant(id: string) {
    if (!confirm("Arkiver denne restauranten? Eksisterende innsjekkinger beholdes.")) return;
    await supabase.from("restaurants").update({ is_active: false }).eq("id", id);
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Navn</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Bydel</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kjøkken</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {restaurants.map((r) =>
              editingId === r.id ? (
                <tr key={r.id} className="bg-brand-50">
                  <td className="px-4 py-2">
                    <input
                      className="w-full px-2 py-1 text-sm border border-brand-300 rounded-lg"
                      value={editData.name ?? ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className="w-full px-2 py-1 text-sm border border-brand-300 rounded-lg"
                      value={editData.neighborhood_id ?? ""}
                      onChange={(e) => setEditData({ ...editData, neighborhood_id: e.target.value })}
                    >
                      <option value="">None</option>
                      {neighborhoods.map((n) => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full px-2 py-1 text-sm border border-brand-300 rounded-lg"
                      value={editData.cuisine_types?.join(", ") ?? ""}
                      placeholder="Italiensk, Pizza"
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          cuisine_types: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className="px-2 py-1 text-sm border border-brand-300 rounded-lg"
                      value={editData.is_active ? "true" : "false"}
                      onChange={(e) => setEditData({ ...editData, is_active: e.target.value === "true" })}
                    >
                      <option value="true">Aktiv</option>
                      <option value="false">Inaktiv</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 flex gap-1">
                    <button onClick={() => saveEdit(r.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.neighborhood?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{r.cuisine_types?.join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {r.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => startEdit(r)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteRestaurant(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
