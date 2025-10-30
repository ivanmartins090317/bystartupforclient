import {getUserProfile, getAllCompanyContracts} from "@/lib/supabase/helpers";
import {ErrorMessage} from "@/components/shared/error-message";
import {ContractsList} from "@/components/contratos/contracts-list";
import {PageHeader} from "@/components/shared/page-header";
import {ContractsRealtimeRefresher} from "@/components/dashboard/contracts-realtime-refresher";
import {createServiceClient} from "@/lib/supabase/service";

/**
 * Revalidação de cache: 300 segundos (5 minutos)
 *
 * Por quê 5 minutos?
 * - Contratos mudam raramente (são documentos legais)
 * - Dados mais estáveis permitem cache mais longo
 * - Melhora performance significativamente
 */
export const revalidate = 0;

export default async function ContratosPage() {
  // Buscar perfil
  const profileResult = await getUserProfile();

  if (profileResult.isError || !profileResult.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Meus Contratos"
          description="Visualize e gerencie todos os seus contratos com a ByStartup"
        />
        <ErrorMessage
          title="Erro ao carregar dados"
          message={profileResult.error || "Não foi possível carregar seus dados."}
        />
      </div>
    );
  }

  // Buscar todos os contratos da empresa
  const contractsResult = await getAllCompanyContracts(profileResult.data.company_id);

  if (contractsResult.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Meus Contratos"
          description="Visualize e gerencie todos os seus contratos com a ByStartup"
        />
        <ErrorMessage
          title="Erro ao carregar contratos"
          message={contractsResult.error || "Não foi possível carregar seus contratos."}
        />
      </div>
    );
  }

  // Buscar quais contratos têm documento publicado
  const contracts = contractsResult.data || [];
  const ids = contracts.map((c) => c.id);
  let publishedIds: string[] = [];
  if (ids.length > 0) {
    const supabase = createServiceClient();
    const {data: publishedRows} = await supabase
      .from("contract_documents")
      .select("contract_id")
      .in("contract_id", ids)
      .not("published_at", "is", null)
      .order("contract_id");
    publishedIds = Array.from(new Set((publishedRows || []).map((r: any) => r.contract_id)));
  }

  return (
    <div className="space-y-6">
      <ContractsRealtimeRefresher companyId={profileResult.data.company_id} />
      <PageHeader
        title="Meus Contratos"
        description="Visualize e gerencie todos os seus contratos com a ByStartup"
      />

      <ContractsList contracts={contracts} publishedIds={publishedIds} />
    </div>
  );
}
