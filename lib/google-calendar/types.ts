/**
 * Tipos para integração com Google Calendar
 */

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
  }>;
}

export interface GoogleCalendarAuthTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export interface AvailableTimeSlot {
  start: string;
  end: string;
  available: boolean;
}
