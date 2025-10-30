"use client";

import {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

interface ContractViewerDialogProps {
  contractId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SignedUrlResponse {
  url: string;
  fileName: string;
  mimeType: string;
}

export function ContractViewerDialog({contractId, title, open, onOpenChange}: ContractViewerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState<SignedUrlResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchUrl() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/contracts/${contractId}/document`, {cache: "no-store"});
        if (!res.ok) throw new Error("Documento indisponível");
        const data = (await res.json()) as SignedUrlResponse;
        if (isMounted) setSigned(data);
      } catch (e) {
        if (isMounted) setError("Nenhum documento publicado para este contrato.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    if (open) fetchUrl();
    return () => {
      isMounted = false;
    };
  }, [open, contractId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando documento…</p>}
          {!isLoading && error && (
            <p className="text-sm text-muted-foreground">{error}</p>
          )}
          {!isLoading && !error && signed?.url && (
            <iframe
              className="w-full h-[60vh] rounded border"
              src={signed.url}
              title="Contrato"
            />
          )}

          <div className="flex justify-end gap-2">
            <Button
              disabled={!signed?.url}
              onClick={() => signed?.url && window.open(signed.url, "_blank", "noopener")}
            >
              Baixar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


