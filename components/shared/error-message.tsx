import {AlertCircle, RefreshCw} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Componente de erro reutilizável
 * 
 * Por quê criar um componente?
 * - Consistência visual em toda aplicação
 * - Evita duplicação de código
 * - Centraliza estilos e comportamento
 */
export function ErrorMessage({
  title = "Ops! Algo deu errado",
  message,
  onRetry,
  retryLabel = "Tentar novamente"
}: ErrorMessageProps) {
  return (
    <Card className="border-accent-500/50 bg-accent-50/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-accent-500/10 p-2">
            <AlertCircle className="h-5 w-5 text-accent-600" />
          </div>
          <CardTitle className="text-accent-900">{title}</CardTitle>
        </div>
        <CardDescription className="text-accent-700">{message}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-accent-500 text-accent-700 hover:bg-accent-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
