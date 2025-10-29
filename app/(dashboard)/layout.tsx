import {ReactNode} from "react";
import {redirect} from "next/navigation";
import {createServerComponentClient} from "@/lib/supabase/server";
import {DashboardHeader} from "@/components/dashboard/dashboard-header";
import {DashboardSidebar} from "@/components/dashboard/dashboard-sidebar";
import {SupportButton} from "@/components/shared/support-button";

export default async function DashboardLayout({children}: {children: ReactNode}) {
  const supabase = await createServerComponentClient();

  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar perfil e empresa do usuário
  // Primeiro, buscar apenas o perfil
  const {data: profile, error: profileError} = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Se não encontrar perfil, buscar empresa separadamente
  let company = null;
  if (profile) {
    const {data: companyData, error: companyError} = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .single();

    company = companyData;
  }

  if (!profile) {
    redirect("/login");
  }

  // Criar objeto profile completo
  const profileWithCompany = {
    ...profile,
    companies: company
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profileWithCompany} />

      <div className="flex">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <SupportButton />
    </div>
  );
}
