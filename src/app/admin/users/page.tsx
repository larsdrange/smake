import { createClient } from "@/lib/supabase/server";
import { UserRoleSelector } from "@/components/admin/UserRoleSelector";
import type { Profile } from "@/types/database";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: { user: me } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Brukere</h1>
        <p className="text-sm text-gray-500 mt-0.5">{count ?? 0} registrerte</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Bruker</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Registrert</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rolle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{user.display_name ?? user.username}</p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(user.created_at).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-3">
                  <UserRoleSelector
                    userId={user.id}
                    currentRole={user.role as Profile["role"]}
                    isMe={user.id === me?.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
