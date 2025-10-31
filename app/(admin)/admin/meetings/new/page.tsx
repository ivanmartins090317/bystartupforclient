import {createServiceClient} from "@/lib/supabase/service";
import {MeetingForm} from "@/components/admin/meetings/meeting-form";
import type {Contract} from "@/types";

interface ContractWithCompany {
  id: string;
  contract_number: string;
  title: string;
  status: "active" | "inactive";
  company_id: string;
  companies: {
    id: string;
    name: string;
  } | null;
}

export default async function NewMeetingPage() {
  const supabase = createServiceClient();

  // Buscar todos os contratos ativos com informações da empresa
  const {data: contracts} = await supabase
    .from("contracts")
    .select("id, contract_number, title, status, company_id, companies(id, name)")
    .eq("status", "active")
    .order("title")
    .returns<ContractWithCompany[]>();

  // Filtrar apenas contratos de clientes (não ByStartup)
  const clientContracts = (contracts || []).filter(
    (contract) => contract.companies?.name?.toLowerCase() !== "bystartup"
  );

  // Mapear para o tipo Contract que o componente espera (apenas campos necessários)
  const mappedContracts: Contract[] = clientContracts.map((contract) => ({
    id: contract.id,
    company_id: contract.company_id,
    contract_number: contract.contract_number,
    title: contract.title,
    description: null,
    signed_date: "",
    status: contract.status,
    contract_file_url: null,
    created_at: "",
    updated_at: ""
  }));

  return <MeetingForm contracts={mappedContracts} />;
}
