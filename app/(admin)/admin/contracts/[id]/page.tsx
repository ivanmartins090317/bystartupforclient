import {createServiceClient} from "@/lib/supabase/service";
import {notFound} from "next/navigation";
import {ContractForm} from "@/components/admin/contracts/contract-form";

export default async function EditContractPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const supabase = createServiceClient();
  const [{data: contract}, {data: companies}] = await Promise.all([
    supabase.from("contracts").select("*").eq("id", id).single(),
    supabase.from("companies").select("id, name").order("name")
  ]);
  if (!contract) return notFound();
  return <ContractForm mode="edit" initial={contract} companies={companies || []} />;
}


