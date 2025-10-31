import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {FileText, ArrowRight} from "lucide-react";
import Link from "next/link";
import type {Contract} from "@/types";
import {EmptyState} from "@/components/shared/empty-state";

interface ContractsOverviewCardProps {
  contracts: Contract[];
  activeContractId?: string;
  totalCount?: number; // total de contratos (ativos + inativos)
}

export function ContractsOverviewCard({
  contracts,
  activeContractId,
  totalCount
}: ContractsOverviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contratos
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/contratos">
            Ver todos
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum contrato ativo"
            description="Seus contratos aparecerão aqui"
            variant="compact"
            withCard={false}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Contratos</span>
              <span className="font-bold text-2xl text-secondary-900">
                {typeof totalCount === "number" ? totalCount : contracts.length}
              </span>
            </div>
            <p className="text-xs text-gray-600">Ativos: {contracts.length}</p>

            <div className="space-y-2">
              {contracts.slice(0, 3).map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 truncate">
                      {contract.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Nº {contract.contract_number}
                    </p>
                  </div>
                  {contract.id === activeContractId && (
                    <Badge className="bg-green-100 text-green-500 ml-2 hover:bg-green-300">
                      Ativo
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {contracts.length > 3 && (
              <p className="text-xs text-center text-gray-600 pt-2">
                E mais {contracts.length - 2} contrato
                {contracts.length - 3 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
