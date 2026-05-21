"use client";

import { useEffect, useRef } from "react";
import type { Restaurant } from "@/types/database";

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  visitedIds?: Set<string>;
}

// Bergen city center
const BERGEN_CENTER: [number, number] = [60.3913, 5.3221];

export function RestaurantMap({
  restaurants,
  center = BERGEN_CENTER,
  zoom = 13,
  className = "h-80",
  visitedIds,
}: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let L: typeof import("leaflet");
    let map: import("leaflet").Map;

    import("leaflet").then((leaflet) => {
      L = leaflet.default;

      // Fix leaflet icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(mapRef.current!, { zoomControl: true }).setView(center, zoom);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom icons
      const visitedIcon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;background:#f97316;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:14px;">✓</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const defaultIcon = L.divIcon({
        className: "",
        html: `<div style="width:24px;height:24px;background:white;border:2px solid #d1d5db;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.2);font-size:12px;">🍴</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      restaurants.forEach((r) => {
        const visited = visitedIds?.has(r.id);
        const marker = L.marker([r.latitude, r.longitude], {
          icon: visited ? visitedIcon : defaultIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="min-width:160px">
            <strong style="font-size:14px">${r.name}</strong>
            ${r.address ? `<p style="font-size:12px;color:#6b7280;margin:4px 0 0">${r.address}</p>` : ""}
            ${r.cuisine_types?.length ? `<p style="font-size:11px;color:#9ca3af;margin:4px 0 0">${r.cuisine_types.join(", ")}</p>` : ""}
            <a href="/restaurants/${r.id}" style="display:block;margin-top:8px;font-size:12px;color:#f97316;text-decoration:none;font-weight:600">Se detaljer →</a>
          </div>
        `);
      });
    });

    return () => {
      if (map) map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} className={`w-full rounded-2xl z-0 ${className}`} />
    </>
  );
}
