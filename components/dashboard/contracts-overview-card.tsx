import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {FileText, ArrowRight} from "lucide-react";
import Link from "next/link";
import {Database} from "@/types/database.types";

type Contract = Database["public"]["Tables"]["contracts"]["Row"];

interface ContractsOverviewCardProps {
  contracts: Contract[];
  activeContractId?: string;
}

export function ContractsOverviewCard({
  contracts,
  activeContractId
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
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhum contrato ativo</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Contratos ativos</span>
              <span className="font-bold text-2xl text-secondary-900">
                {contracts.length}
              </span>
            </div>

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
                    <Badge className="bg-primary-500 text-secondary-900 ml-2">
                      Ativo
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {contracts.length > 3 && (
              <p className="text-xs text-center text-gray-600 pt-2">
                E mais {contracts.length - 3} contrato
                {contracts.length - 3 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
