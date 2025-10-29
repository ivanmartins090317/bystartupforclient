import {createServerComponentClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {MeetingsList} from "@/components/reunioes/meetings-list";
import {PageHeader} from "@/components/shared/page-header";

export default async function ReunioesPage() {
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

  // Buscar todas as reuniões dos contratos
  const {data: meetings} =
    contractIds.length > 0
      ? await supabase
          .from("meetings")
          .select("*")
          .in("contract_id", contractIds)
          .order("meeting_date", {ascending: false})
      : {data: []};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas Reuniões"
        description="Acompanhe suas reuniões agendadas e acesse resumos de reuniões anteriores"
      />

      <MeetingsList meetings={meetings || []} />
    </div>
  );
}
