import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {type LucideIcon} from "lucide-react";

interface EmptyStateProps {
  /**
   * Ícone a ser exibido (componente Lucide Icon).
   */
  icon: LucideIcon;
  /**
   * Título principal do empty state.
   */
  title: string;
  /**
   * Descrição adicional (opcional).
   */
  description?: string;
  /**
   * Ação opcional (botão ou link).
   */
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "default" | "outline" | "ghost";
  };
  /**
   * Variante de tamanho: "default" para páginas completas, "compact" para cards.
   * @default "default"
   */
  variant?: "default" | "compact";
  /**
   * Se deve renderizar dentro de um Card.
   * @default true
   */
  withCard?: boolean;
}

/**
 * Componente reutilizável para exibir estados vazios (empty states).
 *
 * Usado quando não há dados para exibir, mantendo consistência visual
 * e melhorando a UX com mensagens claras e ações orientativas.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  withCard = true
}: EmptyStateProps) {
  const iconSize = variant === "compact" ? "h-12 w-12" : "h-16 w-16";
  const padding = variant === "compact" ? "py-8" : "py-12";

  const content = (
    <div className={`flex flex-col items-center justify-center text-center ${padding}`}>
      <Icon className={`${iconSize} text-gray-300 mb-4`} />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-center max-w-md mb-4">{description}</p>
      )}
      {action && (
        <div className="mt-2">
          {action.href ? (
            <Button variant={action.variant || "outline"} asChild>
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button variant={action.variant || "outline"} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (withCard) {
    return (
      <Card>
        <CardContent className="p-0">{content}</CardContent>
      </Card>
    );
  }

  return content;
}
