import {createServerComponentClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {WelcomeCard} from "@/components/dashboard/welcome-card";
import {NextMeetingCard} from "@/components/dashboard/next-meeting-card";
import {RecentMeetingsCard} from "@/components/dashboard/recent-meetings-card";
import {ContractServicesCard} from "@/components/dashboard/contract-services-card";
import {ContractsOverviewCard} from "@/components/dashboard/contracts-overview-card";

export default async function DashboardPage() {
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
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Buscar contratos da empresa
  const {data: contracts} = await supabase
    .from("contracts")
    .select("*")
    .eq("company_id", profile.company_id)
    .eq("status", "active")
    .order("signed_date", {ascending: false});

  const activeContract = contracts?.[0];

  // Buscar próxima reunião
  const {data: nextMeeting} = await supabase
    .from("meetings")
    .select("*")
    .eq("status", "scheduled")
    .gte("meeting_date", new Date().toISOString())
    .order("meeting_date", {ascending: true})
    .limit(1)
    .single();

  // Buscar últimas reuniões
  const {data: recentMeetings} = await supabase
    .from("meetings")
    .select("*")
    .in("status", ["completed", "scheduled"])
    .order("meeting_date", {ascending: false})
    .limit(5);

  // Buscar serviços do contrato ativo
  const {data: services} = activeContract
    ? await supabase.from("services").select("*").eq("contract_id", activeContract.id)
    : {data: null};

  return (
    <div className="space-y-6">
      <WelcomeCard
        userName={profile.full_name}
        companyName={profile.companies?.name || ""}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <NextMeetingCard meeting={nextMeeting} />
        <ContractsOverviewCard
          contracts={contracts || []}
          activeContractId={activeContract?.id}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentMeetingsCard meetings={recentMeetings || []} />
        </div>
        <div>
          <ContractServicesCard
            services={services || []}
            contractTitle={activeContract?.title}
          />
        </div>
      </div>
    </div>
  );
}
