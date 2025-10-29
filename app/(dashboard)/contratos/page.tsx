import {getUserProfile, getAllCompanyContracts} from "@/lib/supabase/helpers";
import {ErrorMessage} from "@/components/shared/error-message";
import {ContractsList} from "@/components/contratos/contracts-list";
import {PageHeader} from "@/components/shared/page-header";

/**
 * Revalidação de cache: 300 segundos (5 minutos)
 *
 * Por quê 5 minutos?
 * - Contratos mudam raramente (são documentos legais)
 * - Dados mais estáveis permitem cache mais longo
 * - Melhora performance significativamente
 */
export const revalidate = 300;

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Contratos"
        description="Visualize e gerencie todos os seus contratos com a ByStartup"
      />

      <ContractsList contracts={contractsResult.data || []} />
    </div>
  );
}
