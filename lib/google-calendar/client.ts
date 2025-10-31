import {google} from "googleapis";
import {getAuthenticatedClient} from "./auth";
import type {GoogleCalendarEvent} from "./types";

/**
 * Cliente Google Calendar autenticado
 */
export function getCalendarClient(tokens: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}) {
  const auth = getAuthenticatedClient(tokens);
  return google.calendar({version: "v3", auth});
}

/**
 * Cria evento no Google Calendar
 */
export async function createCalendarEvent(
  tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
  },
  event: GoogleCalendarEvent
) {
  const calendar = getCalendarClient(tokens);
  const calendarId = "primary"; // Calendário primário do admin

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      attendees: event.attendees
    }
  });

  return response.data;
}

/**
 * Atualiza evento no Google Calendar
 */
export async function updateCalendarEvent(
  tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
  },
  eventId: string,
  event: Partial<GoogleCalendarEvent>
) {
  const calendar = getCalendarClient(tokens);

  const response = await calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      attendees: event.attendees
    }
  });

  return response.data;
}

/**
 * Exclui evento do Google Calendar
 */
export async function deleteCalendarEvent(
  tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
  },
  eventId: string
) {
  const calendar = getCalendarClient(tokens);

  await calendar.events.delete({
    calendarId: "primary",
    eventId
  });

  return {success: true};
}

/**
 * Busca próximo evento futuro do Google Calendar
 * Considera apenas eventos futuros ou que passaram há menos de 10 minutos
 */
export async function getNextCalendarEvent(tokens: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}) {
  try {
    const calendar = getCalendarClient(tokens);
    const calendarId = "primary";
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Buscar eventos a partir de 10 minutos atrás (para considerar eventos que acabaram de passar)
    const response = await calendar.events.list({
      calendarId,
      timeMin: tenMinutesAgo.toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime"
    });

    const events = response.data.items || [];

    // Filtrar apenas eventos que ainda não passaram há mais de 10 minutos e que tenham data/hora definida
    const futureEvents = events
      .filter((event) => {
        if (!event.start?.dateTime && !event.start?.date) {
          return false;
        }

        const eventStart = new Date(event.start.dateTime || event.start.date || "");

        // Ignorar eventos que já passaram há mais de 10 minutos ou estão cancelados
        if (eventStart < tenMinutesAgo || event.status === "cancelled") {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.start?.dateTime || a.start?.date || "");
        const dateB = new Date(b.start?.dateTime || b.start?.date || "");
        return dateA.getTime() - dateB.getTime();
      });

    // Retornar o primeiro evento (próximo)
    return futureEvents.length > 0 ? futureEvents[0] : null;
  } catch (error) {
    console.error("Erro ao buscar próximo evento do Google Calendar:", error);
    return null;
  }
}