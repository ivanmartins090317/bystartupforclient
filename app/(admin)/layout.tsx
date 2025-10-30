import {ReactNode} from "react";
import {redirect} from "next/navigation";
import {createServerComponentClient} from "@/lib/supabase/server";
import {DashboardHeader} from "@/components/dashboard/dashboard-header";
import {BackToDashboard} from "@/components/admin/back-to-dashboard";

export default async function AdminLayout({children}: {children: ReactNode}) {
  const supabase = await createServerComponentClient();

  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar perfil e verificar se é admin
  const {data: profile} = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <BackToDashboard />
          {children}
        </div>
      </main>
    </div>
  );
}
