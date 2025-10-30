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
