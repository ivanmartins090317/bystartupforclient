import {z} from "zod";

/**
 * Schemas de validação usando Zod para formulários do sistema.
 *
 * Benefícios:
 * - Validação type-safe (TypeScript)
 * - Mensagens de erro consistentes em português
 * - Reutilização de schemas
 * - Validação no frontend e backend (futuro)
 */

/**
 * Schema para formulário de login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido. Digite um email válido.")
    .toLowerCase()
    .trim(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema para formulário de solicitação de suporte
 */
export const supportRequestSchema = z.object({
  subject: z
    .string()
    .min(3, "Assunto deve ter pelo menos 3 caracteres")
    .max(100, "Assunto deve ter no máximo 100 caracteres")
    .trim(),
  message: z
    .string()
    .min(10, "Mensagem deve ter pelo menos 10 caracteres")
    .max(1000, "Mensagem deve ter no máximo 1000 caracteres")
    .trim()
});

export type SupportRequestFormData = z.infer<typeof supportRequestSchema>;
