/**
 * ValidaÃ§Ãµes para operaÃ§Ãµes de reuniÃµes
 */

/**
 * Verifica se a reuniÃ£o pode ser modificada (excluÃ­da/reagendada)
 * Regra: Apenas se faltar mais de 24 horas para a reuniÃ£o
 */
export function canModifyMeeting(meetingDate: Date): {
  canModify: boolean;
  hoursUntilMeeting: number;
  errorMessage?: string;
} {
  const now = new Date();
  const meeting = new Date(meetingDate);

  // Calcular diferenÃ§a em horas
  const diffMs = meeting.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 0) {
    return {
      canModify: false,
      hoursUntilMeeting: 0,
      errorMessage: "Esta reuniÃ£o jÃ¡ aconteceu ou estÃ¡ em andamento."
    };
  }

  if (diffHours < 24) {
    return {
      canModify: false,
      hoursUntilMeeting: Math.round(diffHours * 10) / 10,
      errorMessage: `NÃ£o Ã© possÃ­vel modificar reuniÃµes com menos de 24 horas de antecedÃªncia. Faltam ${Math.round(diffHours * 10) / 10} horas.`
    };
  }

  return {
    canModify: true,
    hoursUntilMeeting: Math.round(diffHours * 10) / 10
  };
}

/**
 * Formata mensagem de erro de validaÃ§Ã£o
 */
export function getValidationErrorMessage(hoursUntilMeeting: number): string {
  if (hoursUntilMeeting <= 0) {
    return "Esta reuniÃ£o jÃ¡ aconteceu ou estÃ¡ em andamento.";
  }

  const hours = Math.round(hoursUntilMeeting * 10) / 10;
  return `NÃ£o Ã© possÃ­vel modificar reuniÃµes com menos de 24 horas de antecedÃªncia. Faltam ${hours} horas atÃ© a reuniÃ£o.`;
}
