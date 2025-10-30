"use client";

import {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {AlertTriangle} from "lucide-react";
import {deleteMeeting} from "@/lib/actions/meetings";
import {toast} from "sonner";
import type {Meeting} from "@/types";

interface DeleteMeetingModalProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteMeetingModal({
  meeting,
  open,
  onOpenChange,
  onSuccess
}: DeleteMeetingModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  // Resetar campo quando modal abrir/fechar
  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setConfirmationText("");
    }
    onOpenChange(newOpen);
  }

  async function handleDelete() {
    if (!meeting) {
      return;
    }

    // Validar confirmação
    if (confirmationText.toUpperCase() !== "SIM") {
      toast.error("Por favor, digite 'SIM' para confirmar a exclusão");
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteMeeting(meeting.id);

      if (result.success) {
        toast.success("Reunião excluída com sucesso!");
        setConfirmationText("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao excluir reunião");
      }
    } catch (error) {
      toast.error("Erro inesperado ao excluir reunião");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  }

  if (!meeting) {
    return null;
  }

  const requiresConfirmation = confirmationText.toUpperCase() !== "SIM";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta reunião? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <p className="font-medium text-secondary-900">{meeting.title}</p>
            <p className="text-sm text-gray-600">
              Esta reunião será removida do Google Calendar e marcada como cancelada.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation-input">
              Para confirmar, digite <strong className="text-red-600">SIM</strong>:
            </Label>
            <Input
              id="confirmation-input"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Digite SIM"
              disabled={isDeleting}
              className="uppercase"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || requiresConfirmation}
            className="w-full sm:w-auto"
          >
            {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
