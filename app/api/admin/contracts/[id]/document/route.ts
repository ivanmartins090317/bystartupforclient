import {NextResponse} from "next/server";
import {createServiceClient} from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: {params: Promise<{id: string}>}) {
  try {
    const {id} = await ctx.params;
    const supabase = createServiceClient();
    const url = new URL(req.url);
    const shouldDownload = url.searchParams.get("download") === "1";

    // 1) Documento publicado mais recente
    const {data: doc} = await supabase
      .from("contract_documents")
      .select("storage_path, file_name, mime_type, published_at")
      .eq("contract_id", id)
      .not("published_at", "is", null)
      .order("published_at", {ascending: false})
      .limit(1)
      .maybeSingle();

    let useDoc = doc;
    let isDraft = false;

    // 2) Fallback para o último enviado (rascunho)
    if (!useDoc) {
      const {data: fallback} = await supabase
        .from("contract_documents")
        .select("storage_path, file_name, mime_type, published_at, created_at")
        .eq("contract_id", id)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
      if (!fallback) {
        return NextResponse.json({message: "Documento não encontrado", contractId: id}, {status: 404});
      }
      useDoc = fallback;
      isDraft = true;
    }

    const relativePath = useDoc.storage_path.replace(/^contracts\//, "");
    const attemptRelative = await supabase.storage
      .from("contracts")
      .createSignedUrl(relativePath, 60, shouldDownload ? {download: useDoc.file_name} : undefined as any);

    let finalUrl = attemptRelative.data?.signedUrl || "";
    let lastError = attemptRelative.error?.message || null;

    if (!finalUrl) {
      const attemptFull = await supabase.storage
        .from("contracts")
        .createSignedUrl(useDoc.storage_path, 60, shouldDownload ? {download: useDoc.file_name} : undefined as any);
      finalUrl = attemptFull.data?.signedUrl || "";
      lastError = attemptFull.error?.message || lastError;
    }

    if (!finalUrl) {
      return NextResponse.json({message: "Falha ao gerar URL", detail: lastError}, {status: 500});
    }

    return NextResponse.json({url: finalUrl, fileName: useDoc.file_name, mimeType: useDoc.mime_type, isDraft});
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unexpected_error";
    return NextResponse.json({message: msg}, {status: 500});
  }
}


