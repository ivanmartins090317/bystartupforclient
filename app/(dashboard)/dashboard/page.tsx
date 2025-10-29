import {
  getUserProfile,
  getCompanyContracts,
  getContractIds,
  getNextMeeting,
  getRecentMeetings,
  getContractServices
} from "@/lib/supabase/helpers";
import {ErrorMessage} from "@/components/shared/error-message";
import {WelcomeCard} from "@/components/dashboard/welcome-card";
import {NextMeetingCard} from "@/components/dashboard/next-meeting-card";
import {RecentMeetingsCard} from "@/components/dashboard/recent-meetings-card";
import {ContractServicesCard} from "@/components/dashboard/contract-services-card";
import {ContractsOverviewCard} from "@/components/dashboard/contracts-overview-card";

export default async function DashboardPage() {
  // Buscar perfil
  const profileResult = await getUserProfile();

  if (profileResult.isError || !profileResult.data) {
    return (
      <div className="space-y-6">
        <ErrorMessage
          title="Erro ao carregar dados"
          message={profileResult.error || "Não foi possível carregar seus dados."}
        />
      </div>
    );
  }

  const profile = profileResult.data;
  const companyId = profile.company_id;

  // Buscar contratos ativos
  const contractsResult = await getCompanyContracts(companyId);

  if (contractsResult.isError) {
    return (
      <div className="space-y-6">
        <ErrorMessage
          title="Erro ao carregar contratos"
          message={contractsResult.error || "Não foi possível carregar seus contratos."}
        />
      </div>
    );
  }

  const contracts = contractsResult.data || [];
  const activeContract = contracts[0];

  // Buscar IDs dos contratos para reuniões
  const contractIdsResult = await getContractIds(companyId);
  const contractIds = contractIdsResult.data || [];

  // Buscar próxima reunião (em paralelo)
  const nextMeetingResult = await getNextMeeting(contractIds);

  // Buscar reuniões recentes (em paralelo)
  const recentMeetingsResult = await getRecentMeetings(contractIds);

  // Buscar serviços do contrato ativo (se houver)
  const servicesResult = activeContract
    ? await getContractServices(activeContract.id)
    : {data: [], error: null, isError: false};

  return (
    <div className="space-y-6">
      <WelcomeCard
        userName={profile.full_name}
        companyName={profile.companies?.name || ""}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {nextMeetingResult.isError ? (
          <ErrorMessage
            title="Erro ao carregar próxima reunião"
            message={
              nextMeetingResult.error ||
              "Não foi possível carregar informações da reunião."
            }
          />
        ) : (
          <NextMeetingCard meeting={nextMeetingResult.data} />
        )}

        <ContractsOverviewCard
          contracts={contracts}
          activeContractId={activeContract?.id}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {recentMeetingsResult.isError ? (
            <ErrorMessage
              title="Erro ao carregar reuniões"
              message={
                recentMeetingsResult.error || "Não foi possível carregar as reuniões."
              }
            />
          ) : (
            <RecentMeetingsCard meetings={recentMeetingsResult.data || []} />
          )}
        </div>
        <div>
          {servicesResult.isError ? (
            <ErrorMessage
              title="Erro ao carregar serviços"
              message={servicesResult.error || "Não foi possível carregar os serviços."}
            />
          ) : (
            <ContractServicesCard
              services={servicesResult.data || []}
              contractTitle={activeContract?.title}
            />
          )}
        </div>
      </div>
    </div>
  );
}
