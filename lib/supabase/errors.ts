import type {PostgrestError} from "@supabase/supabase-js";

/**
 * Mapeia erros do Supabase para mensagens amigáveis ao usuário
 *
 * Por quê isso é importante?
 * - Erros do Supabase são técnicos (ex: "relation does not exist")
 * - Usuários não entendem mensagens técnicas
 * - Precisamos traduzir para algo claro e acionável
 */
export interface ErrorResult<T> {
  data: T | null;
  error: string | null;
  isError: boolean;
}

/**
 * Tipos comuns de erro do Supabase e suas traduções
 */
const ERROR_MESSAGES: Record<string, string> = {
  PGRST116: "Nenhum registro encontrado",
  "23505": "Este registro já existe",
  "23503": "Referência inválida",
  "42501": "Você não tem permissão para acessar este recurso",
  "relation does not exist": "Tabela não encontrada no banco de dados",
  JWT: "Sessão expirada. Por favor, faça login novamente",
  "Invalid API key": "Configuração incorreta. Entre em contato com o suporte"
};

/**
 * Extrai mensagem de erro amigável do erro do Supabase
 */
export function getErrorMessage(error: PostgrestError | Error | null): string {
  if (!error) return "Erro desconhecido";

  // Erro do Supabase
  if ("code" in error) {
    const code = error.code;
    if (code && ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code];
    }

    if (error.message) {
      // Tenta encontrar mensagem traduzida pela mensagem
      for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
        if (error.message.includes(key)) {
          return value;
        }
      }
    }
  }

  // Erro padrão do JavaScript
  if (error instanceof Error) {
    return error.message || "Ocorreu um erro inesperado";
  }

  return "Erro desconhecido";
}

/**
 * Wrapper para queries do Supabase com tratamento de erro padrão
 *
 * Retorna um objeto { data, error, isError } em vez de lançar exceção
 * Isso permite tratamento mais granular nas páginas
 */
export function handleSupabaseError<T>(result: {
  data: T | null;
  error: PostgrestError | null;
}): ErrorResult<T> {
  if (result.error) {
    return {
      data: null,
      error: getErrorMessage(result.error),
      isError: true
    };
  }

  return {
    data: result.data,
    error: null,
    isError: false
  };
}

/**
 * Verifica se um erro é relacionado a autenticação
 * Útil para redirecionar usuário não autenticado
 */
export function isAuthError(error: PostgrestError | Error | null): boolean {
  if (!error) return false;

  if ("code" in error) {
    const message = error.message?.toLowerCase() || "";
    return (
      message.includes("jwt") ||
      message.includes("unauthorized") ||
      message.includes("permission denied")
    );
  }

  return false;
}
