"use server";

import {createServiceClient} from "@/lib/supabase/service";
import {revalidatePath} from "next/cache";

export interface UpsertContractInput {
  id?: string;
  company_id: string;
  contract_number: string;
  title: string;
  description?: string | null;
  signed_date: string; // ISO date
  status: "active" | "inactive";
}

export async function createContract(input: UpsertContractInput) {
  const supabase = createServiceClient();

  // Validar que o contrato não está sendo criado para a empresa "ByStartup"
  const {data: compCheck} = await supabase
    .from("companies")
    .select("name")
    .eq("id", input.company_id)
    .single();
  if (compCheck?.name?.toLowerCase() === "bystartup") {
    throw new Error("Contrato deve ser associado à empresa cliente (não à ByStartup).");
  }

  const {error} = await supabase.from("contracts").insert({
    company_id: input.company_id,
    contract_number: input.contract_number,
    title: input.title,
    description: input.description ?? null,
    signed_date: input.signed_date,
    status: input.status
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/contracts");
  // Revalidar telas do cliente
  revalidatePath("/dashboard");
  revalidatePath("/contratos");
}

export async function updateContract(id: string, input: Omit<UpsertContractInput, "id">) {
  const supabase = createServiceClient();

  // Validar que o contrato não está sendo alterado para a empresa "ByStartup"
  const {data: compCheck} = await supabase
    .from("companies")
    .select("name")
    .eq("id", input.company_id)
    .single();
  if (compCheck?.name?.toLowerCase() === "bystartup") {
    throw new Error("Contrato deve ser associado à empresa cliente (não à ByStartup).");
  }

  const {error} = await supabase.from("contracts").update({
    company_id: input.company_id,
    contract_number: input.contract_number,
    title: input.title,
    description: input.description ?? null,
    signed_date: input.signed_date,
    status: input.status
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/contracts/${id}`);
  revalidatePath("/admin/contracts");
  // Revalidar telas do cliente
  revalidatePath("/dashboard");
  revalidatePath("/contratos");
}

export async function deleteContract(id: string) {
  const supabase = createServiceClient();

  const {error} = await supabase.from("contracts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/contracts");
  // Revalidar telas do cliente
  revalidatePath("/dashboard");
  revalidatePath("/contratos");
}


