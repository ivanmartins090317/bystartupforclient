"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {toast} from "sonner";
import {createMeeting, type CreateMeetingInput} from "@/lib/actions/meetings";
import type {Contract} from "@/types";
import {DEPARTMENT_LABELS} from "@/types";

interface MeetingFormProps {
  contracts: Contract[];
}

export function MeetingForm({contracts}: MeetingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractId, setContractId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState<"comercial" | "tecnologia" | "marketing">(
    "comercial"
  );
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  const validContracts = contracts.filter((c) => c.status === "active");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!contractId || !title || !meetingDate || !meetingTime) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Combinar data e hora em ISO string
    const dateTimeString = `${meetingDate}T${meetingTime}:00`;
    const meetingDateTime = new Date(dateTimeString).toISOString();

    if (isNaN(new Date(meetingDateTime).getTime())) {
      toast.error("Data ou hora inválida");
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateMeetingInput = {
        contract_id: contractId,
        title,
        department,
        meeting_date: meetingDateTime
      };

      const result = await createMeeting(input);

      if (result.success) {
        toast.success("Reunião criada com sucesso!");
        router.push("/admin/meetings");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao criar reunião");
      }
    } catch (error) {
      toast.error("Erro inesperado ao criar reunião");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Nova Reunião</h1>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="contract">Contrato *</Label>
          <Select value={contractId} onValueChange={setContractId} required>
            <SelectTrigger id="contract">
              <SelectValue placeholder="Selecione um contrato" />
            </SelectTrigger>
            <SelectContent>
              {validContracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id}>
                  {contract.title} - {contract.contract_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validContracts.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Nenhum contrato ativo disponível
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="title">Título da Reunião *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Reunião de acompanhamento Q1 2025"
            required
          />
        </div>

        <div>
          <Label htmlFor="department">Departamento *</Label>
          <Select
            value={department}
            onValueChange={(v) => setDepartment(v as "comercial" | "tecnologia" | "marketing")}
            required
          >
            <SelectTrigger id="department">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comercial">{DEPARTMENT_LABELS.comercial}</SelectItem>
              <SelectItem value="tecnologia">{DEPARTMENT_LABELS.tecnologia}</SelectItem>
              <SelectItem value="marketing">{DEPARTMENT_LABELS.marketing}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="meetingDate">Data *</Label>
            <Input
              id="meetingDate"
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div>
            <Label htmlFor="meetingTime">Hora *</Label>
            <Input
              id="meetingTime"
              type="time"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || validContracts.length === 0}>
          {isSubmitting ? "Criando..." : "Criar Reunião"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

