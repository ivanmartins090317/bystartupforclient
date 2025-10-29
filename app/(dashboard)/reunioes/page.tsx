import {
  getUserProfile,
  getContractIds,
  getMeetingsByContracts
} from "@/lib/supabase/helpers";
import {ErrorMessage} from "@/components/shared/error-message";
import {MeetingsList} from "@/components/reunioes/meetings-list";
import {PageHeader} from "@/components/shared/page-header";

export default async function ReunioesPage() {
  // Buscar perfil
  const profileResult = await getUserProfile();

  if (profileResult.isError || !profileResult.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Minhas Reuniões"
          description="Acompanhe suas reuniões agendadas e acesse resumos de reuniões anteriores"
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
          title="Minhas Reuniões"
          description="Acompanhe suas reuniões agendadas e acesse resumos de reuniões anteriores"
        />
        <ErrorMessage
          title="Erro ao carregar contratos"
          message={contractIdsResult.error || "Não foi possível carregar seus contratos."}
        />
      </div>
    );
  }

  // Buscar reuniões
  const meetingsResult = await getMeetingsByContracts(contractIdsResult.data || []);

  if (meetingsResult.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Minhas Reuniões"
          description="Acompanhe suas reuniões agendadas e acesse resumos de reuniões anteriores"
        />
        <ErrorMessage
          title="Erro ao carregar reuniões"
          message={meetingsResult.error || "Não foi possível carregar suas reuniões."}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas Reuniões"
        description="Acompanhe suas reuniões agendadas e acesse resumos de reuniões anteriores"
      />

      <MeetingsList meetings={meetingsResult.data || []} />
    </div>
  );
}
