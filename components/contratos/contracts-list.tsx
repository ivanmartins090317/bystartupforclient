"use client";

import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Download, Eye, FileText} from "lucide-react";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import type {ContractWithServices} from "@/lib/supabase/helpers";
import type {StatusFilter} from "@/types";
import {SERVICE_TYPE_LABELS} from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {EmptyState} from "@/components/shared/empty-state";
import {ContractViewerDialog} from "@/components/contratos/contract-viewer-dialog";

interface ContractsListProps {
  contracts: ContractWithServices[];
}

export function ContractsList({contracts}: ContractsListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openContractId, setOpenContractId] = useState<string | null>(null);

  function handleStatusChange(value: string) {
    // Type guard: só aceita valores válidos
    if (value === "all" || value === "active" || value === "inactive") {
      setStatusFilter(value);
    }
  }

  const filteredContracts = contracts.filter((contract) => {
    if (statusFilter === "all") return true;
    return contract.status === statusFilter;
  });

  if (contracts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhum contrato encontrado"
        description="Entre em contato com nossa equipe para iniciar um novo projeto ou esclarecer dúvidas sobre seus contratos."
        action={{
          label: "Entrar em contato",
          href: "#",
          variant: "outline"
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filtrar por:</span>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-gray-600">
          {filteredContracts.length} contrato{filteredContracts.length !== 1 && "s"}
        </p>
      </div>

      {/* Contracts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary-900 text-lg leading-tight mb-1">
                    {contract.title}
                  </h3>
                  <p className="text-sm text-gray-600">Nº {contract.contract_number}</p>
                </div>
                <Badge
                  className={
                    contract.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {contract.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              {/* Description */}
              {contract.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {contract.description}
                </p>
              )}

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>
                  Assinado em{" "}
                  {format(new Date(contract.signed_date), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR
                  })}
                </span>
              </div>

              {/* Services */}
              {contract.services.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 uppercase">
                    Serviços incluídos
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {contract.services.map((service) => (
                      <Badge key={service.id} variant="outline" className="text-xs">
                        {SERVICE_TYPE_LABELS[service.type]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setOpenContractId(contract.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar
                </Button>
                {contract.contract_file_url && (
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a
                      href={contract.contract_file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </Button>
                )}
              </div>
              {openContractId === contract.id && (
                <ContractViewerDialog
                  contractId={contract.id}
                  title={contract.title}
                  open={openContractId === contract.id}
                  onOpenChange={(open) => setOpenContractId(open ? contract.id : null)}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
