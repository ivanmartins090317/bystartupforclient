"use client";

import {useState, useTransition} from "react";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {deleteContract} from "@/app/(admin)/admin/contracts/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";

interface Props {
  id: string;
  title: string;
}

export function DeleteContractButton({id, title}: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function confirmDelete() {
    startTransition(async () => {
      const t = toast.loading("Excluindo contrato...");
      try {
        await deleteContract(id);
        toast.success("Contrato excluído.", {id: t});
        setOpen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha ao excluir";
        toast.error(msg, {id: t});
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-red-500 hover:text-red-600"
          variant="destructive"
          disabled={isPending}
        >
          Excluir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir contrato?</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o contrato &quot;{title}&quot;? Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            className="text-red-500 hover:text-red-600"
            variant="destructive"
            onClick={confirmDelete}
            disabled={isPending}
          >
            Sim, excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
