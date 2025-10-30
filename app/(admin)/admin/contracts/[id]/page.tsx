import {createServiceClient} from "@/lib/supabase/service";
import {notFound} from "next/navigation";
import {ContractForm} from "@/components/admin/contracts/contract-form";
import {ContractDocumentsList} from "@/components/admin/contracts/contract-documents-list";

export default async function EditContractPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const supabase = createServiceClient();
  const [{data: contract}, {data: companies}, {data: documents}] = await Promise.all([
    supabase.from("contracts").select("*").eq("id", id).single(),
    supabase.from("companies").select("id, name").order("name"),
    supabase
      .from("contract_documents")
      .select("id, file_name, mime_type, published_at, created_at")
      .eq("contract_id", id)
      .order("created_at", {ascending: false})
  ]);
  if (!contract) return notFound();
  return (
    <div className="space-y-8">
      <ContractForm mode="edit" initial={contract} companies={companies || []} />
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">Documentos</h2>
        <ContractDocumentsList contractId={id} documents={(documents || []) as any} />
      </div>
    </div>
  );
}


