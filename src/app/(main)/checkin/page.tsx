import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { CheckInForm } from "@/components/checkin/CheckInForm";

export default async function CheckInPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/checkin");

  return (
    <>
      <TopBar title="Sjekk inn" />
      <div className="px-4 pt-4">
        <CheckInForm userId={user.id} />
      </div>
    </>
  );
}
