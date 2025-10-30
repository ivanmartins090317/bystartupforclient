import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

export async function GET(_request: Request, {params}: {params: {id: string}}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({message: "Configuração do Supabase ausente"}, {status: 500});
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Documento publicado mais recente para o contrato
  const {data: doc, error} = await supabase
    .from("contract_documents")
    .select("storage_path, file_name, mime_type")
    .eq("contract_id", params.id)
    .not("published_at", "is", null)
    .order("published_at", {ascending: false})
    .limit(1)
    .single();

  if (error || !doc) {
    return NextResponse.json({message: "Documento não encontrado"}, {status: 404});
  }

  const {data: signed, error: signErr} = await supabase
    .storage
    .from("contracts")
    .createSignedUrl(doc.storage_path, 60, {download: doc.file_name});

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({message: "Falha ao gerar URL"}, {status: 500});
  }

  return NextResponse.json({url: signed.signedUrl, fileName: doc.file_name, mimeType: doc.mime_type});
}


