"use client";

import {useState, useTransition} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {createContract, updateContract} from "@/app/(admin)/admin/contracts/actions";
import {uploadContractDocument} from "@/app/(admin)/admin/contracts/[id]/upload/action";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

interface CompanyOption { id: string; name: string }

interface ContractFormProps {
  mode: "create" | "edit";
  companies: CompanyOption[];
  initial?: any;
}

export function ContractForm({mode, companies, initial}: ContractFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const validCompanies = companies.filter(c => c.name.toLowerCase() !== "bystartup");
  const [companyId, setCompanyId] = useState(
    initial?.company_id ?? (validCompanies[0]?.id || "")
  );
  const [status, setStatus] = useState<"active" | "inactive">(initial?.status ?? "active");
  const [number, setNumber] = useState(initial?.contract_number ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState<string>(initial?.description ?? "");
  const [signed, setSigned] = useState<string>(initial?.signed_date ?? new Date().toISOString().slice(0,10));
  const [file, setFile] = useState<File | null>(null);
  const [publish, setPublish] = useState(true);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const toastId = toast.loading("Salvando contrato...");
      try {
        if (mode === "create") {
          await createContract({
            company_id: companyId,
            contract_number: number,
            title,
            description: desc || null,
            signed_date: signed,
            status
          });
        } else {
          await updateContract(initial.id, {
            company_id: companyId,
            contract_number: number,
            title,
            description: desc || null,
            signed_date: signed,
            status
          });
          if (file) {
            await uploadContractDocument({contractId: initial.id, file, publish});
          }
        }
        toast.success("Contrato salvo com sucesso.", {id: toastId});
        router.push("/admin/contracts");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao salvar";
        toast.error(message, {id: toastId});
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">{mode === "create" ? "Novo contrato" : "Editar contrato"}</h1>

      <div className="grid gap-4">
        <div>
          <Label>Empresa</Label>
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {validCompanies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Número</Label>
            <Input value={number} onChange={e => setNumber(e.target.value)} required />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Título</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Assinado em</Label>
            <Input type="date" value={signed} onChange={e => setSigned(e.target.value)} required />
          </div>
        </div>
      </div>

      {mode === "edit" && (
        <div className="space-y-2">
          <Label>Upload do PDF (opcional)</Label>
          <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={publish} onChange={e => setPublish(e.target.checked)} />
            Publicar agora
          </label>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : "Salvar"}</Button>
      </div>
    </form>
  );
}


