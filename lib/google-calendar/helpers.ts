import type {Meeting} from "@/types";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from "./client";
import type {GoogleCalendarAuthTokens} from "./types";

/**
 * Converte reunião do banco para formato Google Calendar
 */
function meetingToCalendarEvent(meeting: Meeting) {
  const meetingDate = new Date(meeting.meeting_date);

  return {
    summary: meeting.title,
    description: `Reunião - Departamento: ${meeting.department}`,
    start: {
      dateTime: meetingDate.toISOString(),
      timeZone: "America/Sao_Paulo"
    },
    end: {
      dateTime: new Date(
        meetingDate.getTime() + 60 * 60 * 1000
      ).toISOString(), // 1 hora de duração
      timeZone: "America/Sao_Paulo"
    }
  };
}

/**
 * Salva reunião no Google Calendar
 * Retorna o google_calendar_event_id
 */
export async function saveMeetingToCalendar(
  tokens: GoogleCalendarAuthTokens,
  meeting: Meeting
) {
  const event = meetingToCalendarEvent(meeting);

  const calendarEvent = await createCalendarEvent(tokens, event);

  return calendarEvent.id || null;
}

/**
 * Atualiza reunião no Google Calendar
 */
export async function updateMeetingInCalendar(
  tokens: GoogleCalendarAuthTokens,
  meeting: Meeting
) {
  if (!meeting.google_calendar_event_id) {
    throw new Error("Reunião não possui google_calendar_event_id");
  }

  const event = meetingToCalendarEvent(meeting);

  await updateCalendarEvent(
    tokens,
    meeting.google_calendar_event_id,
    event
  );

  return {success: true};
}

/**
 * Exclui reunião do Google Calendar
 */
export async function removeMeetingFromCalendar(
  tokens: GoogleCalendarAuthTokens,
  meeting: Meeting
) {
  if (!meeting.google_calendar_event_id) {
    throw new Error("Reunião não possui google_calendar_event_id");
  }

  await deleteCalendarEvent(tokens, meeting.google_calendar_event_id);

  return {success: true};
}
