import {getCalendarClient} from "./client";
import type {GoogleCalendarAuthTokens, AvailableTimeSlot} from "./types";

/**
 * Consulta horários disponíveis no calendário do admin
 */
export async function getAvailableTimeSlots(
  tokens: GoogleCalendarAuthTokens,
  startDate: Date,
  endDate: Date,
  durationMinutes: number = 60
): Promise<AvailableTimeSlot[]> {
  try {
    const calendar = getCalendarClient(tokens);
    const calendarId = "primary"; // Calendário primário do admin

    // Buscar eventos no período
    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    });

    const events = response.data.items || [];

    // Converter eventos para slots ocupados
    const busySlots = events
      .filter(
        (event) => event.start?.dateTime || event.start?.date // Ignorar eventos sem data/hora
      )
      .map((event) => {
        const start = new Date(event.start?.dateTime || event.start?.date || "");
        const end = new Date(event.end?.dateTime || event.end?.date || "");
        return {start, end};
      })
      .filter((slot) => !isNaN(slot.start.getTime()) && !isNaN(slot.end.getTime())); // Remover inválidos

    // Gerar slots disponíveis (de 30 em 30 minutos)
    const availableSlots: AvailableTimeSlot[] = [];
    const slotDuration = durationMinutes * 60 * 1000; // em ms
    const current = new Date(startDate);

    // Garantir que começamos em um horário "redondo" (ex: 09:00, 09:30, 10:00)
    current.setMinutes(Math.floor(current.getMinutes() / 30) * 30, 0, 0);

    while (current < endDate) {
      const slotEnd = new Date(current.getTime() + slotDuration);

      // Verificar se o slot não conflita com nenhum evento ocupado
      const hasConflict = busySlots.some(
        (busy) =>
          // Slot começa durante evento ocupado
          (current >= busy.start && current < busy.end) ||
          // Slot termina durante evento ocupado
          (slotEnd > busy.start && slotEnd <= busy.end) ||
          // Slot envolve evento ocupado completamente
          (current <= busy.start && slotEnd >= busy.end)
      );

      // Apenas adicionar slots que não estão no passado e não têm conflitos
      if (!hasConflict && current >= new Date()) {
        availableSlots.push({
          start: current.toISOString(),
          end: slotEnd.toISOString(),
          available: true
        });
      }

      // Próximo slot (incrementar de 30 em 30 minutos)
      current.setMinutes(current.getMinutes() + 30);
    }

    return availableSlots;
  } catch (error) {
    console.error("Erro ao consultar disponibilidade:", error);
    return [];
  }
}

/**
 * Verifica se um horário específico está disponível
 */
export async function checkTimeSlotAvailability(
  tokens: GoogleCalendarAuthTokens,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    const calendar = getCalendarClient(tokens);
    const calendarId = "primary";

    const response = await calendar.events.list({
      calendarId,
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true,
      maxResults: 1 // Apenas precisamos saber se existe algum evento
    });

    const events = response.data.items || [];

    // Se não há eventos no período, está disponível
    return events.length === 0;
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return false; // Em caso de erro, considerar indisponível para segurança
  }
}
