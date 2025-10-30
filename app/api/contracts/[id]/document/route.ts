import {NextResponse} from "next/server";
export const dynamic = "force-dynamic";
import {createServerComponentClient} from "@/lib/supabase/server";
import {createServiceClient} from "@/lib/supabase/service";

export async function GET(_request: Request, ctx: {params: Promise<{id: string}>}) {
  try {
    const {id} = await ctx.params;
    const supabase = await createServerComponentClient();
    const service = createServiceClient();

    // Garantir contexto do usuário e sua empresa
    const {data: userCtx} = await supabase.auth.getUser();
    if (!userCtx.user) {
      return NextResponse.json({message: "Não autenticado"}, {status: 401});
    }
    const {data: profile} = await service
      .from("profiles")
      .select("company_id")
      .eq("id", userCtx.user.id)
      .single();
    if (!profile) {
      return NextResponse.json({message: "Perfil não encontrado"}, {status: 403});
    }

    // 1) Validar que o contrato pertence à empresa do usuário
    const {data: contract} = await service
      .from("contracts")
      .select("id, company_id")
      .eq("id", id)
      .single();
    if (!contract || contract.company_id !== profile.company_id) {
      return NextResponse.json(
        {message: "Contrato não pertence à empresa", contractId: id},
        {status: 403}
      );
    }

    // 2) Buscar documento publicado mais recente desse contrato
    const {data: doc} = await service
      .from("contract_documents")
      .select("storage_path, file_name, mime_type, published_at")
      .eq("contract_id", id)
      .not("published_at", "is", null)
      .order("published_at", {ascending: false})
      .limit(1)
      .maybeSingle();

    let useDoc = doc;
    let isDraft = false;

    // Fallback: se não houver publicado, usar o mais recente (rascunho)
    if (!useDoc) {
      const {data: fallback} = await service
        .from("contract_documents")
        .select("storage_path, file_name, mime_type, published_at, created_at")
        .eq("contract_id", id)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
      if (!fallback) {
        return NextResponse.json(
          {
            message: "Documento não encontrado",
            contractId: id,
            debug: {count: 0, items: []}
          },
          {status: 404}
        );
      }
      useDoc = fallback;
      isDraft = true;
    }

    const relativePath = useDoc.storage_path.replace(/^contracts\//, "");
    const attemptRelative = await service.storage
      .from("contracts")
      .createSignedUrl(relativePath, 60, {download: useDoc.file_name});

    let finalUrl = attemptRelative.data?.signedUrl || "";
    let lastError = attemptRelative.error?.message || null;

    if (!finalUrl) {
      const attemptFull = await service.storage
        .from("contracts")
        .createSignedUrl(useDoc.storage_path, 60, {download: useDoc.file_name});
      finalUrl = attemptFull.data?.signedUrl || "";
      lastError = attemptFull.error?.message || lastError;
    }

    if (!finalUrl) {
      return NextResponse.json(
        {
          message: "Falha ao gerar URL",
          detail: lastError,
          tried: [relativePath, useDoc.storage_path]
        },
        {status: 500}
      );
    }

    return NextResponse.json({
      url: finalUrl,
      fileName: useDoc.file_name,
      mimeType: useDoc.mime_type,
      isDraft
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unexpected_error";
    return NextResponse.json({message: "Erro inesperado", detail: msg}, {status: 500});
  }
}
