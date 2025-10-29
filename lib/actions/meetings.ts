"use server";

import {getMeetingById, updateMeeting} from "@/lib/supabase/helpers";
import {
  saveMeetingToCalendar,
  updateMeetingInCalendar,
  removeMeetingFromCalendar
} from "@/lib/google-calendar/helpers";
import {checkTimeSlotAvailability} from "@/lib/google-calendar/availability";
import {canModifyMeeting} from "@/lib/utils/meeting-validation";
import type {GoogleCalendarAuthTokens} from "@/lib/google-calendar/types";

/**
 * Busca tokens do Google Calendar
 * Prioridade:
 * 1. Banco de dados (Fase 5 - produção)
 * 2. Variáveis de ambiente (fallback temporário para desenvolvimento)
 */
async function getGoogleCalendarTokens(): Promise<GoogleCalendarAuthTokens | null> {
  try {
    // 1. Tentar buscar do banco de dados (Fase 5)
    const {getGoogleCalendarTokensFromDB} = await import("@/lib/google-calendar/tokens");
    const dbResult = await getGoogleCalendarTokensFromDB();

    if (!dbResult.isError && dbResult.data) {
      console.log("[getGoogleCalendarTokens] Tokens obtidos do banco de dados");
      return dbResult.data;
    }

    // 2. Fallback: variáveis de ambiente (para desenvolvimento/migração)
    const testAccessToken = process.env.GOOGLE_TEST_ACCESS_TOKEN;

    if (testAccessToken) {
      console.log(
        "[getGoogleCalendarTokens] Usando tokens das variáveis de ambiente (fallback)"
      );
      return {
        access_token: testAccessToken,
        refresh_token: process.env.GOOGLE_TEST_REFRESH_TOKEN,
        expiry_date: process.env.GOOGLE_TEST_EXPIRY_DATE
          ? Number.parseInt(process.env.GOOGLE_TEST_EXPIRY_DATE, 10)
          : undefined
      };
    }

    // Nenhum token encontrado
    console.warn(
      "[getGoogleCalendarTokens] Nenhum token encontrado (nem no banco, nem em variáveis de ambiente)"
    );
    return null;
  } catch (error) {
    console.error("[getGoogleCalendarTokens] Erro ao buscar tokens:", error);

    // Fallback para variáveis de ambiente em caso de erro
    const testAccessToken = process.env.GOOGLE_TEST_ACCESS_TOKEN;

    if (testAccessToken) {
      return {
        access_token: testAccessToken,
        refresh_token: process.env.GOOGLE_TEST_REFRESH_TOKEN,
        expiry_date: process.env.GOOGLE_TEST_EXPIRY_DATE
          ? Number.parseInt(process.env.GOOGLE_TEST_EXPIRY_DATE, 10)
          : undefined
      };
    }

    return null;
  }
}

/**
 * Salva reunião no Google Calendar
 */
export async function saveMeetingToGoogleCalendar(meetingId: string) {
  try {
    // Buscar reunião
    const meetingResult = await getMeetingById(meetingId);

    if (meetingResult.isError || !meetingResult.data) {
      return {
        success: false,
        error: meetingResult.error || "Reunião não encontrada"
      };
    }

    const meeting = meetingResult.data;

    // Verificar se já está salva
    if (meeting.google_calendar_event_id) {
      return {
        success: false,
        error: "Esta reunião já está salva no Google Calendar"
      };
    }

    // Obter tokens (temporário - será melhorado na Fase 5)
    const tokens = await getGoogleCalendarTokens();

    if (!tokens) {
      console.error(
        "[saveMeetingToGoogleCalendar] Tokens não encontrados. Verifique GOOGLE_TEST_ACCESS_TOKEN no .env.local"
      );
      return {
        success: false,
        error:
          "Google Calendar não está configurado. Entre em contato com o administrador."
      };
    }

    // Salvar no Google Calendar
    console.log("[saveMeetingToGoogleCalendar] Tentando salvar no Google Calendar...", {
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      meetingDate: meeting.meeting_date
    });

    let calendarEventId: string | null;

    try {
      calendarEventId = await saveMeetingToCalendar(tokens, meeting);

      if (!calendarEventId) {
        console.error(
          "[saveMeetingToGoogleCalendar] Google Calendar retornou null/undefined para eventId"
        );
        return {
          success: false,
          error: "Erro ao salvar no Google Calendar"
        };
      }

      console.log(
        "[saveMeetingToGoogleCalendar] Evento criado no Google Calendar:",
        calendarEventId
      );
    } catch (calendarError) {
      console.error(
        "[saveMeetingToGoogleCalendar] Erro ao criar evento no Google Calendar:",
        calendarError
      );
      return {
        success: false,
        error:
          calendarError instanceof Error
            ? calendarError.message
            : "Erro ao salvar no Google Calendar"
      };
    }

    // Atualizar banco com google_calendar_event_id
    const updateResult = await updateMeeting(meetingId, {
      google_calendar_event_id: calendarEventId
    });

    if (updateResult.isError) {
      return {
        success: false,
        error: updateResult.error || "Erro ao atualizar reunião no banco"
      };
    }

    return {
      success: true,
      data: {google_calendar_event_id: calendarEventId}
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao salvar reunião"
    };
  }
}

/**
 * Exclui reunião (remove do Google Calendar e atualiza status)
 */
export async function deleteMeeting(meetingId: string) {
  try {
    // Buscar reunião
    const meetingResult = await getMeetingById(meetingId);

    if (meetingResult.isError || !meetingResult.data) {
      return {
        success: false,
        error: meetingResult.error || "Reunião não encontrada"
      };
    }

    const meeting = meetingResult.data;
    const meetingDate = new Date(meeting.meeting_date);

    // Validar 24h
    const validation = canModifyMeeting(meetingDate);

    if (!validation.canModify) {
      return {
        success: false,
        error: validation.errorMessage || "Não é possível excluir esta reunião"
      };
    }

    // Remover do Google Calendar (se tiver google_calendar_event_id)
    if (meeting.google_calendar_event_id) {
      const tokens = await getGoogleCalendarTokens();

      if (tokens) {
        try {
          await removeMeetingFromCalendar(tokens, meeting);
        } catch (error) {
          // Log erro mas continua (não bloqueia exclusão)
          console.error("Erro ao remover do Google Calendar:", error);
        }
      }
    }

    // Atualizar status para cancelled
    const updateResult = await updateMeeting(meetingId, {
      status: "cancelled"
    });

    if (updateResult.isError) {
      return {
        success: false,
        error: updateResult.error || "Erro ao atualizar reunião"
      };
    }

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir reunião"
    };
  }
}

/**
 * Reagenda reunião
 */
export async function rescheduleMeeting(
  meetingId: string,
  newDate: string // ISO string
) {
  try {
    // Buscar reunião
    const meetingResult = await getMeetingById(meetingId);

    if (meetingResult.isError || !meetingResult.data) {
      return {
        success: false,
        error: meetingResult.error || "Reunião não encontrada"
      };
    }

    const meeting = meetingResult.data;
    const currentMeetingDate = new Date(meeting.meeting_date);
    const newMeetingDate = new Date(newDate);

    // Validar 24h (usando data atual)
    const validation = canModifyMeeting(currentMeetingDate);

    if (!validation.canModify) {
      return {
        success: false,
        error: validation.errorMessage || "Não é possível reagendar esta reunião"
      };
    }

    // Validar se nova data não é no passado
    if (newMeetingDate <= new Date()) {
      return {
        success: false,
        error: "A nova data deve ser no futuro"
      };
    }

    // Verificar disponibilidade no Google Calendar antes de reagendar
    const tokens = await getGoogleCalendarTokens();
    if (tokens) {
      try {
        const endTime = new Date(newMeetingDate.getTime() + 60 * 60 * 1000); // +1 hora
        const isAvailable = await checkTimeSlotAvailability(
          tokens,
          newMeetingDate,
          endTime
        );

        if (!isAvailable) {
          return {
            success: false,
            error:
              "Este horário não está disponível no calendário do administrador. Por favor, escolha outro horário."
          };
        }
      } catch (error) {
        // Log erro mas continua (não bloqueia se houver problema na verificação)
        console.error("Erro ao verificar disponibilidade:", error);
      }

      // Atualizar no Google Calendar (se tiver google_calendar_event_id)
      if (meeting.google_calendar_event_id) {
        try {
          // Criar reunião atualizada
          const updatedMeeting = {
            ...meeting,
            meeting_date: newDate
          };

          await updateMeetingInCalendar(tokens, updatedMeeting);
        } catch (error) {
          // Log erro mas continua (não bloqueia reagendamento)
          console.error("Erro ao atualizar no Google Calendar:", error);
        }
      }
    }

    // Atualizar banco
    const updateResult = await updateMeeting(meetingId, {
      meeting_date: newDate
    });

    if (updateResult.isError) {
      return {
        success: false,
        error: updateResult.error || "Erro ao atualizar reunião"
      };
    }

    return {
      success: true,
      data: {meeting: updateResult.data}
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao reagendar reunião"
    };
  }
}
