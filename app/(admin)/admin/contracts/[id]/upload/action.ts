"use server";

import {createClient} from "@supabase/supabase-js";
import {createServerComponentClient} from "@/lib/supabase/server";
import {revalidatePath} from "next/cache";
import {randomUUID} from "crypto";

interface UploadArgs {
  contractId: string;
  file: File;
  publish: boolean;
}

function assertPdf(file: File) {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) throw new Error("Envie um arquivo PDF válido.");
  const maxBytes = 25 * 1024 * 1024; // 25MB
  if (file.size > maxBytes) throw new Error("Arquivo excede 25MB.");
}

export async function uploadContractDocument({contractId, file, publish}: UploadArgs) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceKey) throw new Error("Configuração do Supabase ausente.");

  assertPdf(file);

  const supabase = createClient(supabaseUrl, serviceKey);

  // Identifica admin autenticado para registrar created_by
  const serverClient = await createServerComponentClient();
  const {data: userCtx} = await serverClient.auth.getUser();
  const createdBy = userCtx.user?.id;
  if (!createdBy) throw new Error("Usuário não autenticado");

  // Garante bucket privado 'contracts'
  try {
    const {data: bucket} = await supabase.storage.getBucket("contracts");
    if (!bucket) {
      await supabase.storage.createBucket("contracts", {public: false});
    }
  } catch {
    // createBucket pode falhar se já existir; ignorar após verificar
  }

  const fileUuid = randomUUID();
  const path = `contracts/${contractId}/${fileUuid}.pdf`;

  const {error: upErr} = await supabase.storage.from("contracts").upload(path, await file.arrayBuffer(), {
    contentType: "application/pdf",
    upsert: false
  });
  if (upErr) throw new Error(upErr.message);

  const {error: insErr} = await supabase.from("contract_documents").insert({
    contract_id: contractId,
    storage_path: path,
    file_name: file.name,
    file_size: file.size,
    mime_type: "application/pdf",
    published_at: publish ? new Date().toISOString() : null,
    created_by: createdBy
  });
  if (insErr) throw new Error(insErr.message);

  // Opcional: se publicar, poderíamos despublicar versões anteriores (não requerido agora)

  // Revalidar tela do cliente para refletir rapidamente
  revalidatePath("/contratos");
  return {ok: true};
}


export async function publishContractDocument(documentId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceKey) throw new Error("Configuração do Supabase ausente.");

  const supabase = createClient(supabaseUrl, serviceKey);

  // Descobrir contrato do documento
  const {data: doc, error: docErr} = await supabase
    .from("contract_documents")
    .select("contract_id")
    .eq("id", documentId)
    .single();
  if (docErr || !doc) throw new Error(docErr?.message || "Documento não encontrado");

  // Despublicar anteriores do mesmo contrato
  const {error: clearErr} = await supabase
    .from("contract_documents")
    .update({published_at: null})
    .eq("contract_id", doc.contract_id)
    .neq("id", documentId);
  if (clearErr) throw new Error(clearErr.message);

  // Publicar o documento atual
  const {error: pubErr} = await supabase
    .from("contract_documents")
    .update({published_at: new Date().toISOString()})
    .eq("id", documentId);
  if (pubErr) throw new Error(pubErr.message);

  revalidatePath("/admin/contracts");
  revalidatePath("/contratos");
  return {ok: true};
}


