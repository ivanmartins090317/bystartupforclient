"use client";

import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Download, Eye, FileText} from "lucide-react";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {Database} from "@/types/database.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type Contract = Database["public"]["Tables"]["contracts"]["Row"] & {
  services: Database["public"]["Tables"]["services"]["Row"][];
};

interface ContractsListProps {
  contracts: Contract[];
}

const serviceTypeLabels = {
  assessoria: "Assessoria",
  desenvolvimento: "Desenvolvimento",
  landing_page: "Landing Page",
  software: "Software"
};

export function ContractsList({contracts}: ContractsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredContracts = contracts.filter((contract) => {
    if (statusFilter === "all") return true;
    return contract.status === statusFilter;
  });

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum contrato encontrado
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            Entre em contato com nossa equipe para iniciar um novo projeto
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filtrar por:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                        {serviceTypeLabels[service.type]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
