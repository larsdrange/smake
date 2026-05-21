"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/types/database";

interface Props {
  userId: string;
  currentRole: Role;
  isMe: boolean;
}

export function UserRoleSelector({ userId, currentRole, isMe }: Props) {
  const [role, setRole] = useState<Role>(currentRole);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleChange(newRole: Role) {
    if (isMe) return;
    setSaving(true);
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setRole(newRole);
    setSaving(false);
  }

  const colors: Record<Role, string> = {
    user: "bg-gray-100 text-gray-600",
    admin: "bg-blue-100 text-blue-700",
    super_admin: "bg-brand-100 text-brand-700",
  };

  if (isMe) {
    return (
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${colors[role]}`}>
        {role === "super_admin" ? "superadmin" : role} (deg)
      </span>
    );
  }

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value as Role)}
      disabled={saving}
      className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${colors[role]}`}
    >
      <option value="user">bruker</option>
      <option value="admin">admin</option>
      <option value="super_admin">superadmin</option>
    </select>
  );
}
