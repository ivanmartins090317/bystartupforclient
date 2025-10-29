import {createServerComponentClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {InsightsGrid} from "@/components/insights/insights-grid";
import {PageHeader} from "@/components/shared/page-header";

export default async function InsightsPage() {
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

  // Buscar contratos da empresa
  const {data: contracts} = await supabase
    .from("contracts")
    .select("id")
    .eq("company_id", profile.company_id);

  const contractIds = contracts?.map((c) => c.id) || [];

  // Buscar insights (globais ou dos contratos do cliente)
  const {data: insights} = await supabase
    .from("insights")
    .select("*")
    .or(`contract_id.is.null,contract_id.in.(${contractIds.join(",")})`)
    .order("published_at", {ascending: false});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Acesse podcasts e vídeos exclusivos criados pela ByStartup"
      />

      <InsightsGrid insights={insights || []} />
    </div>
  );
}
