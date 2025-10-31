"use server";

import {createServerComponentClient} from "@/lib/supabase/server";
import {handleSupabaseError, type ErrorResult} from "@/lib/supabase/errors";
import type {GoogleCalendarAuthTokens} from "./types";

export interface GoogleCalendarTokenRecord {
  id: string;
  admin_id: string;
  access_token: string;
  refresh_token: string | null;
  expiry_date: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Busca tokens do Google Calendar do admin
 * Retorna tokens do primeiro admin encontrado (em produção, você pode querer especificar qual admin)
 */
export async function getGoogleCalendarTokensFromDB(): Promise<
  ErrorResult<GoogleCalendarAuthTokens>
> {
  try {
    const supabase = await createServerComponentClient();

    // Buscar tokens do admin
    // Aqui assumimos que apenas um admin terá tokens configurados
    // Se houver múltiplos admins, você pode modificar para buscar por admin_id específico
    const {data, error} = await supabase
      .from("google_calendar_tokens")
      .select(
        "id, admin_id, access_token, refresh_token, expiry_date, created_at, updated_at"
      )
      .limit(1)
      .maybeSingle();

    if (error) {
      return {
        data: null,
        error: error.message || "Erro ao buscar tokens",
        isError: true
      };
    }

    if (!data) {
      return {
        data: null,
        error: "Tokens não encontrados no banco de dados",
        isError: true
      };
    }

    // Verificar se o token expirou (com margem de 5 minutos para refresh proativo)
    const now = Date.now();
    const expiryDate = data.expiry_date || 0;
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutos em milissegundos

    if (expiryDate > 0 && now >= expiryDate - fiveMinutesInMs) {
      // Token expirado ou próximo de expirar - tentar refresh se tiver refresh_token
      if (data.refresh_token) {
        console.log(
          "[getGoogleCalendarTokensFromDB] Token expirado ou próximo de expirar, tentando refresh..."
        );
        const refreshResult = await refreshGoogleCalendarToken(
          data.id,
          data.refresh_token
        );

        if (refreshResult.isError || !refreshResult.data) {
          // Se refresh falhou mas ainda temos tempo, usar token antigo
          if (expiryDate > 0 && now < expiryDate) {
            console.warn(
              "[getGoogleCalendarTokensFromDB] Refresh falhou, usando token antigo até expirar"
            );
            return {
              data: {
                access_token: data.access_token,
                refresh_token: data.refresh_token || undefined,
                expiry_date: data.expiry_date || undefined
              },
              error: null,
              isError: false
            };
          }

          return {
            data: null,
            error: refreshResult.error || "Erro ao renovar token expirado",
            isError: true
          };
        }

        return refreshResult;
      }

      // Sem refresh_token disponível
      if (expiryDate > 0 && now < expiryDate) {
        // Ainda válido por alguns segundos
        return {
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token || undefined,
            expiry_date: data.expiry_date || undefined
          },
          error: null,
          isError: false
        };
      }

      return {
        data: null,
        error: "Token expirado e sem refresh_token disponível",
        isError: true
      };
    }

    return {
      data: {
        access_token: data.access_token,
        refresh_token: data.refresh_token || undefined,
        expiry_date: data.expiry_date || undefined
      },
      error: null,
      isError: false
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar tokens",
      isError: true
    };
  }
}

/**
 * Salva tokens do Google Calendar no banco
 */
export async function saveGoogleCalendarTokens(
  adminId: string,
  tokens: GoogleCalendarAuthTokens
): Promise<ErrorResult<GoogleCalendarTokenRecord>> {
  try {
    const supabase = await createServerComponentClient();

    // Converter expiry_date de number (ms) para BIGINT
    const expiryDate = tokens.expiry_date
      ? Number.parseInt(String(tokens.expiry_date), 10)
      : null;

    // Upsert: se já existir, atualiza; se não, insere
    const {data, error} = await supabase
      .from("google_calendar_tokens")
      .upsert(
        {
          admin_id: adminId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          expiry_date: expiryDate
        },
        {
          onConflict: "admin_id"
        }
      )
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: error.message || "Erro ao salvar tokens",
        isError: true
      };
    }

    if (!data) {
      return {
        data: null,
        error: "Erro ao salvar tokens - nenhum dado retornado",
        isError: true
      };
    }

    return {
      data: data as GoogleCalendarTokenRecord,
      error: null,
      isError: false
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao salvar tokens",
      isError: true
    };
  }
}

/**
 * Atualiza tokens existentes
 */
export async function updateGoogleCalendarTokens(
  recordId: string,
  tokens: Partial<GoogleCalendarAuthTokens>
): Promise<ErrorResult<GoogleCalendarTokenRecord>> {
  try {
    const supabase = await createServerComponentClient();

    const updates: Record<string, unknown> = {};

    if (tokens.access_token) {
      updates.access_token = tokens.access_token;
    }

    if (tokens.refresh_token !== undefined) {
      updates.refresh_token = tokens.refresh_token || null;
    }

    if (tokens.expiry_date !== undefined) {
      updates.expiry_date = tokens.expiry_date
        ? Number.parseInt(String(tokens.expiry_date), 10)
        : null;
    }

    const {data, error} = await supabase
      .from("google_calendar_tokens")
      .update(updates)
      .eq("id", recordId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: error.message || "Erro ao atualizar tokens",
        isError: true
      };
    }

    if (!data) {
      return {
        data: null,
        error: "Erro ao atualizar tokens - nenhum dado retornado",
        isError: true
      };
    }

    return {
      data: data as GoogleCalendarTokenRecord,
      error: null,
      isError: false
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao atualizar tokens",
      isError: true
    };
  }
}

/**
 * Renova access token usando refresh token
 */
export async function refreshGoogleCalendarToken(
  recordId: string,
  refreshToken: string
): Promise<ErrorResult<GoogleCalendarAuthTokens>> {
  try {
    const {getOAuth2Client} = await import("./auth");
    const oauth2Client = getOAuth2Client();

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const {credentials} = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      return {
        data: null,
        error: "Erro ao renovar token - access_token não retornado",
        isError: true
      };
    }

    // Atualizar no banco
    const updateResult = await updateGoogleCalendarTokens(recordId, {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token || refreshToken,
      expiry_date: credentials.expiry_date
        ? Number.parseInt(String(credentials.expiry_date), 10)
        : undefined
    });

    if (updateResult.isError || !updateResult.data) {
      return {
        data: null,
        error: updateResult.error || "Erro ao salvar token renovado",
        isError: true
      };
    }

    return {
      data: {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || refreshToken,
        expiry_date: credentials.expiry_date
          ? Number.parseInt(String(credentials.expiry_date), 10)
          : undefined
      },
      error: null,
      isError: false
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao renovar token do Google Calendar",
      isError: true
    };
  }
}
