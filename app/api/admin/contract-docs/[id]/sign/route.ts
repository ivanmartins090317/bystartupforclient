import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, {params}: {params: {id: string}}) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceKey) return NextResponse.json({error: "missing_config"}, {status: 500});

    const supabase = createClient(supabaseUrl, serviceKey);

    const {data: doc, error} = await supabase
      .from("contract_documents")
      .select("storage_path, file_name, mime_type")
      .eq("id", params.id)
      .single();
    if (error || !doc) return NextResponse.json({error: error?.message || "not_found"}, {status: 404});

    const relativePath = doc.storage_path.replace(/^contracts\//, "");
    const {data: signed, error: signErr} = await supabase.storage
      .from("contracts")
      .createSignedUrl(relativePath, 60, {download: doc.file_name});
    if (signErr || !signed?.signedUrl) return NextResponse.json({error: signErr?.message || "sign_failed", pathTried: relativePath}, {status: 500});

    return NextResponse.json({url: signed.signedUrl, fileName: doc.file_name, mimeType: doc.mime_type});
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unexpected_error";
    return NextResponse.json({error: msg}, {status: 500});
  }
}


