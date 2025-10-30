import {createServiceClient} from "@/lib/supabase/service";
import {ContractForm} from "@/components/admin/contracts/contract-form";

export default async function NewContractPage() {
  const supabase = createServiceClient();
  const {data: companies} = await supabase.from("companies").select("id, name").order("name");
  return <ContractForm mode="create" companies={companies || []} />;
}


