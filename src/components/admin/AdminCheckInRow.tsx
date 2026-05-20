"use client";

import Image from "next/image";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  checkIn: Record<string, unknown>;
}

export function AdminCheckInRow({ checkIn: initial }: Props) {
  const [deleted, setDeleted] = useState(false);
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("Slett denne innsjekkingen?")) return;
    await supabase.from("check_ins").delete().eq("id", initial.id as string);
    setDeleted(true);
  }

  if (deleted) return null;

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
      {initial.photo_url && (
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          <Image
            src={initial.photo_url as string}
            alt="Food"
            width={56}
            height={56}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">@{initial.username as string}</p>
        <p className="text-xs text-gray-500 truncate">{initial.restaurant_name as string}</p>
        {initial.review && (
          <p className="text-xs text-gray-400 truncate mt-0.5">"{initial.review as string}"</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {initial.rating && (
          <span className="text-xs text-amber-500">★ {initial.rating as number}</span>
        )}
        <span className="text-xs text-gray-400">
          {formatRelativeTime(initial.created_at as string)}
        </span>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
