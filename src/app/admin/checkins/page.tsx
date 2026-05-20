import { createClient } from "@/lib/supabase/server";
import { AdminCheckInRow } from "@/components/admin/AdminCheckInRow";

export default async function AdminCheckInsPage() {
  const supabase = await createClient();

  const { data: checkIns, count } = await supabase
    .from("check_in_feed")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Innsjekkinger</h1>
        <p className="text-sm text-gray-500 mt-0.5">{count ?? 0} totalt</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {checkIns?.map((ci) => (
          <AdminCheckInRow key={ci.id} checkIn={ci} />
        ))}
      </div>
    </div>
  );
}
