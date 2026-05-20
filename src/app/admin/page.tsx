import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: restaurantCount },
    { count: userCount },
    { count: checkInCount },
    { data: recentCheckIns },
  ] = await Promise.all([
    supabase.from("restaurants").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("check_ins").select("id", { count: "exact", head: true }),
    supabase
      .from("check_in_feed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Restauranter", value: restaurantCount ?? 0, color: "bg-brand-500" },
    { label: "Brukere", value: userCount ?? 0, color: "bg-blue-500" },
    { label: "Innsjekkinger", value: checkInCount ?? 0, color: "bg-green-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Oversikt</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-1.5 rounded-full ${color} mb-3`} />
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent check-ins */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Siste innsjekkinger</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {recentCheckIns?.map((ci) => (
            <div key={ci.id} className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">@{ci.username}</p>
                <p className="text-xs text-gray-500">{ci.restaurant_name}</p>
              </div>
              {ci.rating && (
                <span className="text-xs text-amber-500 font-medium">★ {ci.rating}</span>
              )}
              <span className="text-xs text-gray-400">
                {new Date(ci.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
