import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Briefcase, Package} from "lucide-react";
import type {Service} from "@/types";
import {SERVICE_TYPE_LABELS} from "@/types";
import {EmptyState} from "@/components/shared/empty-state";

interface ContractServicesCardProps {
  services: Service[];
  contractTitle?: string;
}

const serviceTypeColors: Record<string, string> = {
  assessoria: "bg-blue-100 text-blue-700",
  desenvolvimento: "bg-purple-100 text-purple-700",
  landing_page: "bg-green-100 text-green-700",
  software: "bg-orange-100 text-orange-700"
};

export function ContractServicesCard({
  services,
  contractTitle
}: ContractServicesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Serviços Contratados
        </CardTitle>
        {contractTitle && <p className="text-sm text-gray-600">{contractTitle}</p>}
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum serviço ativo"
            description="Os serviços do seu contrato aparecerão aqui"
            variant="compact"
            withCard={false}
          />
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="p-3 rounded-lg border bg-white space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-secondary-900 flex-1">
                    {service.name}
                  </h4>
                  <Badge className={`text-xs ${serviceTypeColors[service.type]}`}>
                    {SERVICE_TYPE_LABELS[service.type]}
                  </Badge>
                </div>
                {service.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
