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
    { label: "Restauranter", value: restaurantCount ?? 0, accent: "from-brand-500 to-brand-400" },
    { label: "Brukere", value: userCount ?? 0, accent: "from-blue-500 to-blue-400" },
    { label: "Innsjekkinger", value: checkInCount ?? 0, accent: "from-green-500 to-green-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white/90">Oversikt</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, accent }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <div className={`w-10 h-1.5 rounded-full bg-gradient-to-r ${accent} mb-3`} />
            <p className="text-3xl font-bold text-white/90">{value}</p>
            <p className="text-sm text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent check-ins */}
      <div className="glass rounded-2xl">
        <div className="p-4 border-b border-white/06">
          <h2 className="font-semibold text-white/80">Siste innsjekkinger</h2>
        </div>
        <div className="divide-y divide-white/04">
          {recentCheckIns?.map((ci) => (
            <div key={ci.id} className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80">@{ci.username}</p>
                <p className="text-xs text-white/35">{ci.restaurant_name}</p>
              </div>
              {ci.rating && (
                <span className="text-xs text-brand-400 font-medium">★ {ci.rating}</span>
              )}
              <span className="text-xs text-white/25">
                {new Date(ci.created_at).toLocaleDateString("nb-NO")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
