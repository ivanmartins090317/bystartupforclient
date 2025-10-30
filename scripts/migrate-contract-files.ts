import {createClient} from "@supabase/supabase-js";
import {randomUUID} from "crypto";
import path from "node:path";

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !service) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(url, service);

  // Garante bucket privado 'contracts'
  try {
    const {data: b} = await supabase.storage.getBucket("contracts");
    if (!b) await supabase.storage.createBucket("contracts", {public: false});
  } catch {}

  const {data: rows, error} = await supabase
    .from("contracts")
    .select("id, contract_file_url")
    .not("contract_file_url", "is", null);

  if (error) throw error;

  const {data: admin} = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single();

  let migrated = 0;
  for (const c of rows || []) {
    const urlStr = c.contract_file_url as string;
    // Já tem documento?
    const {data: existing} = await supabase
      .from("contract_documents")
      .select("id")
      .eq("contract_id", c.id)
      .limit(1);
    if (existing && existing.length > 0) continue;

    try {
      const res = await fetch(urlStr);
      if (!res.ok) {
        console.warn("Falha ao baixar:", c.id, urlStr);
        continue;
      }
      const buf = await res.arrayBuffer();
      const filename = path.basename(new URL(urlStr).pathname) || `${randomUUID()}.pdf`;
      const objectPath = `legacy/${c.id}/${filename}`;

      const {error: upErr} = await supabase.storage
        .from("contracts")
        .upload(objectPath, buf, {contentType: "application/pdf", upsert: false});
      if (upErr) {
        console.warn("Upload falhou:", c.id, upErr.message);
        continue;
      }

      const {error: insErr} = await supabase.from("contract_documents").insert({
        contract_id: c.id,
        storage_path: objectPath,
        file_name: filename,
        file_size: buf.byteLength,
        mime_type: "application/pdf",
        published_at: new Date().toISOString(),
        created_by: admin?.id ?? "00000000-0000-0000-0000-000000000000"
      });
      if (insErr) {
        console.warn("Insert falhou:", c.id, insErr.message);
        continue;
      }
      migrated++;
    } catch (e) {
      console.warn("Erro contrato:", c.id, e);
    }
  }

  console.log(`Migração finalizada. Migrados: ${migrated}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


