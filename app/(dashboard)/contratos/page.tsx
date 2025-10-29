import {createServerComponentClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {ContractsList} from "@/components/contratos/contracts-list";
import {PageHeader} from "@/components/shared/page-header";

export default async function ContratosPage() {
  const supabase = await createServerComponentClient();

  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar perfil e empresa
  const {data: profile} = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Buscar todos os contratos da empresa
  const {data: contracts} = await supabase
    .from("contracts")
    .select("*, services(*)")
    .eq("company_id", profile.company_id)
    .order("signed_date", {ascending: false});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Contratos"
        description="Visualize e gerencie todos os seus contratos com a ByStartup"
      />

      <ContractsList contracts={contracts || []} />
    </div>
  );
}
