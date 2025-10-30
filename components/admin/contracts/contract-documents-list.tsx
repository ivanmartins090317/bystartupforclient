"use client";

import {useState, useTransition} from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {publishContractDocument} from "@/app/(admin)/admin/contracts/[id]/upload/action";
import {toast} from "sonner";

interface ContractDocumentItem {
  id: string;
  file_name: string;
  mime_type: string;
  published_at: string | null;
  created_at: string;
}

interface ContractDocumentsListProps {
  contractId: string;
  documents: ContractDocumentItem[];
}

export function ContractDocumentsList({contractId, documents}: ContractDocumentsListProps) {
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handlePublish(documentId: string) {
    startTransition(async () => {
      const toastId = toast.loading("Publicando documento...");
      try {
        await publishContractDocument(documentId);
        toast.success("Documento publicado com sucesso.", {id: toastId});
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha ao publicar";
        toast.error(msg, {id: toastId});
      }
    });
  }

  async function signUrlForContract({download = false}: {download?: boolean} = {}) {
    const res = await fetch(`/api/admin/contracts/${contractId}/document${download ? "?download=1" : ""}`, {cache: "no-store"});
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const reason = data && (data.message || data.error) ? ` (${data.message || data.error})` : "";
      throw new Error(`Falha ao gerar link${reason}`);
    }
    return (data.url as string) || "";
  }

  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p>;
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between rounded border p-3">
          <div className="min-w-0">
            <p className="font-medium truncate">{doc.file_name}</p>
            <p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            {doc.published_at ? (
              <Badge>Publicado</Badge>
            ) : (
              <Badge variant="outline">Rascunho</Badge>
            )}
            {!doc.published_at && (
              <Button size="sm" onClick={() => handlePublish(doc.id)} disabled={isPending}>
                {isPending ? "Publicando..." : "Publicar"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  const url = await signUrlForContract({download: false});
                  setPreviewUrl(url);
                  window.open(url, "_blank", "noopener");
                } catch (e) {
                  const msg = e instanceof Error ? e.message : "Erro ao abrir";
                  toast.error(msg);
                }
              }}
            >
              Visualizar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  const url = await signUrlForContract({download: true});
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = doc.file_name;
                  a.target = "_blank";
                  a.rel = "noopener";
                  a.click();
                } catch (e) {
                  const msg = e instanceof Error ? e.message : "Erro ao baixar";
                  toast.error(msg);
                }
              }}
            >
              Baixar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}


