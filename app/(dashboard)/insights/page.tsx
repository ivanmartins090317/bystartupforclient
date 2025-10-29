import {getUserProfile, getContractIds, getInsights} from "@/lib/supabase/helpers";
import {ErrorMessage} from "@/components/shared/error-message";
import {InsightsGrid} from "@/components/insights/insights-grid";
import {PageHeader} from "@/components/shared/page-header";

export default async function InsightsPage() {
  // Buscar perfil
  const profileResult = await getUserProfile();

  if (profileResult.isError || !profileResult.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Insights"
          description="Acesse podcasts e vídeos exclusivos criados pela ByStartup"
        />
        <ErrorMessage
          title="Erro ao carregar dados"
          message={profileResult.error || "Não foi possível carregar seus dados."}
        />
      </div>
    );
  }

  // Buscar IDs dos contratos
  const contractIdsResult = await getContractIds(profileResult.data.company_id);

  if (contractIdsResult.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Insights"
          description="Acesse podcasts e vídeos exclusivos criados pela ByStartup"
        />
        <ErrorMessage
          title="Erro ao carregar contratos"
          message={contractIdsResult.error || "Não foi possível carregar seus contratos."}
        />
      </div>
    );
  }

  // Buscar insights
  const insightsResult = await getInsights(contractIdsResult.data || []);

  if (insightsResult.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Insights"
          description="Acesse podcasts e vídeos exclusivos criados pela ByStartup"
        />
        <ErrorMessage
          title="Erro ao carregar insights"
          message={insightsResult.error || "Não foi possível carregar os insights."}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Acesse podcasts e vídeos exclusivos criados pela ByStartup"
      />

      <InsightsGrid insights={insightsResult.data || []} />
    </div>
  );
}
