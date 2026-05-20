import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, Utensils, Users, CheckSquare, Award, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Oversikt", icon: LayoutDashboard, exact: true },
  { href: "/admin/restaurants", label: "Restauranter", icon: Utensils },
  { href: "/admin/users", label: "Brukere", icon: Users },
  { href: "/admin/checkins", label: "Innsjekkinger", icon: CheckSquare },
  { href: "/admin/badges", label: "Merker", icon: Award },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect("/feed");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-4 border-b border-gray-100">
          <p className="font-bold text-lg text-brand-600">Smake Admin</p>
          <p className="text-xs text-gray-400 capitalize">{profile.role === "super_admin" ? "superadmin" : profile.role === "admin" ? "administrator" : "bruker"}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link
            href="/feed"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Tilbake til appen
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-6 max-w-5xl">{children}</main>
    </div>
  );
}
