import {redirect} from "next/navigation";
import {createServerComponentClient} from "@/lib/supabase/server";
import {
  getErrorMessage,
  handleSupabaseError,
  isAuthError,
  type ErrorResult
} from "@/lib/supabase/errors";
import type {
  ProfileWithCompany,
  Contract,
  ContractWithServices,
  Meeting,
  Service,
  Insight
} from "@/types";

/**
 * Re-exportar tipos para uso externo
 */
export type {ProfileWithCompany, ContractWithServices};

/**
 * Busca o perfil do usuário autenticado com sua empresa
 *
 * Funcionalidade central reutilizada em várias páginas.
 * Centralizar aqui evita:
 * - Duplicação de código
 * - Inconsistências no tratamento de erro
 * - Queries diferentes que buscam a mesma coisa
 */
export async function getUserProfile(): Promise<ErrorResult<ProfileWithCompany>> {
  try {
    const supabase = await createServerComponentClient();

    // 1. Verificar autenticação
    const {
      data: {user},
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    // 2. Buscar perfil com join na empresa (apenas campos necessários)
    const {data: profile, error: profileError} = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, avatar_url, company_id, role, created_at, updated_at, companies(id, name, logo_url)"
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      // Erro de autenticação = redirecionar
      if (isAuthError(profileError)) {
        redirect("/login");
      }

      return {
        data: null,
        error: getErrorMessage(profileError),
        isError: true
      };
    }

    if (!profile) {
      return {
        data: null,
        error: "Perfil não encontrado. Entre em contato com o suporte.",
        isError: true
      };
    }

    // Type assertion seguro: Supabase retorna o tipo correto com join
    return {
      data: profile as unknown as ProfileWithCompany,
      error: null,
      isError: false
    };
  } catch (error) {
    // Erros inesperados (network, timeouts, etc)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar perfil do usuário",
      isError: true
    };
  }
}

/**
 * Busca contratos ativos de uma empresa
 */
export async function getCompanyContracts(
  companyId: string
): Promise<ErrorResult<Contract[]>> {
  try {
    const supabase = await createServerComponentClient();

    const {data, error} = await supabase
      .from("contracts")
      .select(
        "id, company_id, contract_number, title, description, signed_date, status, contract_file_url, created_at, updated_at"
      )
      .eq("company_id", companyId)
      .eq("status", "active")
      .order("signed_date", {ascending: false});

    return handleSupabaseError({data, error});
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar contratos",
      isError: true
    };
  }
}

/**
 * Busca todos os contratos de uma empresa (ativos e inativos) com serviços
 */
export async function getAllCompanyContracts(
  companyId: string
): Promise<ErrorResult<ContractWithServices[]>> {
  try {
    const supabase = await createServerComponentClient();

    const {data, error} = await supabase
      .from("contracts")
      .select(
        "id, company_id, contract_number, title, description, signed_date, status, contract_file_url, created_at, updated_at, services(id, contract_id, name, description, type, created_at)"
      )
      .eq("company_id", companyId)
      .order("signed_date", {ascending: false});

    // Type assertion: Supabase infere o tipo com join, mas precisamos garantir o tipo
    const typedData = (data || []) as unknown as ContractWithServices[];
    return handleSupabaseError({data: typedData, error});
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar contratos",
      isError: true
    };
  }
}

/**
 * Busca IDs de contratos de uma empresa
 */
export async function getContractIds(companyId: string): Promise<ErrorResult<string[]>> {
  try {
    const supabase = await createServerComponentClient();

    const {data, error} = await supabase
      .from("contracts")
      .select("id")
      .eq("company_id", companyId);

    if (error) {
      return handleSupabaseError<string[]>({data: null, error});
    }

    const ids = (data || []).map((c) => c.id);
    return {
      data: ids,
      error: null,
      isError: false
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar IDs dos contratos",
      isError: true
    };
  }
}

/**
 * Atualiza automaticamente reuniões que já passaram há mais de 10 minutos para status "completed"
 */
async function markPastMeetingsAsCompleted(
  contractIds: string[]
): Promise<void> {
  try {
    if (contractIds.length === 0) {
      return;
    }

    const supabase = await createServerComponentClient();
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutos atrás

    // Buscar reuniões agendadas que já passaram há mais de 10 minutos
    const {data: pastMeetings, error: selectError} = await supabase
      .from("meetings")
      .select("id")
      .in("contract_id", contractIds)
      .eq("status", "scheduled")
      .lt("meeting_date", tenMinutesAgo.toISOString());

    if (selectError) {
      console.warn("Erro ao buscar reuniões passadas:", selectError);
      return;
    }

    if (!pastMeetings || pastMeetings.length === 0) {
      return;
    }

    // Atualizar status para "completed"
    const meetingIds = pastMeetings.map((m) => m.id);
    const {error: updateError} = await supabase
      .from("meetings")
      .update({
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .in("id", meetingIds);

    if (updateError) {
      console.warn("Erro ao atualizar reuniões passadas:", updateError);
    } else if (pastMeetings.length > 0) {
      console.log(
        `[markPastMeetingsAsCompleted] ${pastMeetings.length} reunião(ões) marcada(s) como concluída(s)`
      );
    }
  } catch (error) {
    // Não deve quebrar o fluxo principal, apenas logar
    console.warn("Erro ao marcar reuniões passadas como concluídas:", error);
  }
}

/**
 * Busca próxima reunião agendada
 * Prioridade:
 * 1. Banco de dados (reuniões criadas no sistema)
 * 2. Google Calendar (eventos externos)
 * 
 * Nota: Atualiza automaticamente reuniões que já passaram há mais de 10 minutos para "completed"
 */
export async function getNextMeeting(
  contractIds: string[]
): Promise<ErrorResult<Meeting | null>> {
  try {
    const supabase = await createServerComponentClient();

    // 0️⃣ Primeiro: atualizar reuniões passadas há mais de 10 minutos
    if (contractIds.length > 0) {
      await markPastMeetingsAsCompleted(contractIds);
    }

    // 1️⃣ Buscar do banco de dados primeiro
    if (contractIds.length > 0) {
      // Buscar reuniões agendadas que ainda não passaram há mais de 10 minutos
      // (considera reuniões futuras ou que passaram há menos de 10 minutos)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      const {data, error} = await supabase
        .from("meetings")
        .select(
          "id, contract_id, title, department, meeting_date, status, google_calendar_event_id, summary, summary_file_url, created_by, created_at, updated_at"
        )
        .in("contract_id", contractIds)
        .eq("status", "scheduled")
        .gte("meeting_date", tenMinutesAgo.toISOString())
        .order("meeting_date", {ascending: true})
        .limit(1)
        .maybeSingle();

      const dbResult = handleSupabaseError({data: data || null, error});

      // Se encontrou no banco, retornar
      if (!dbResult.isError && dbResult.data) {
        return dbResult;
      }
    }

    // 2️⃣ Se não encontrou no banco, tentar buscar do Google Calendar
    try {
      const {getGoogleCalendarTokensFromDB} = await import("@/lib/google-calendar/tokens");
      const {getNextCalendarEvent} = await import("@/lib/google-calendar/client");

      const tokensResult = await getGoogleCalendarTokensFromDB();

      if (tokensResult.isError || !tokensResult.data) {
        // Sem tokens, retornar null sem erro (calendário não configurado)
        return {data: null, error: null, isError: false};
      }

      const calendarEvent = await getNextCalendarEvent(tokensResult.data);

      if (!calendarEvent || !calendarEvent.start?.dateTime) {
        return {data: null, error: null, isError: false};
      }

      // Buscar perfil do usuário para campos obrigatórios
      const profileResult = await getUserProfile();
      if (profileResult.isError || !profileResult.data) {
        return {data: null, error: null, isError: false};
      }

      const profile = profileResult.data;

      // Converter evento do Google Calendar para formato Meeting
      const eventStart = new Date(calendarEvent.start.dateTime);
      const eventId = calendarEvent.id || `google-${Date.now()}`;

      // Se não há contratos, não podemos criar uma reunião válida
      if (contractIds.length === 0) {
        return {data: null, error: null, isError: false};
      }

      // Criar objeto Meeting compatível com o tipo
      const meetingFromCalendar: Meeting = {
        id: eventId,
        contract_id: contractIds[0],
        title: calendarEvent.summary || "Reunião do Google Calendar",
        department: "comercial", // Default, pode ser melhorado com análise do título/descrição
        meeting_date: eventStart.toISOString(),
        status: "scheduled",
        google_calendar_event_id: calendarEvent.id || null,
        summary: calendarEvent.description || null,
        summary_file_url: null,
        created_by: profile.id,
        created_at: eventStart.toISOString(),
        updated_at: eventStart.toISOString()
      };

      return {data: meetingFromCalendar, error: null, isError: false};
    } catch (calendarError) {
      // Erro ao buscar do Google Calendar não deve impedir o retorno
      console.warn("Erro ao buscar reunião do Google Calendar:", calendarError);
      return {data: null, error: null, isError: false};
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar próxima reunião",
      isError: true
    };
  }
}

/**
 * Busca reuniões recentes
 * 
 * Critérios para aparecer:
 * 1. Deve estar associada a um contrato da empresa (contract_id em contractIds)
 * 2. Status deve ser "completed" ou "scheduled" (não "cancelled")
 * 3. Ordena por data mais recente primeiro
 * 4. Limita a 10 reuniões
 * 
 * Observação: Reuniões passadas são automaticamente marcadas como "completed"
 * após 10 minutos do horário agendado (ver markPastMeetingsAsCompleted)
 */
export async function getRecentMeetings(
  contractIds: string[]
): Promise<ErrorResult<Meeting[]>> {
  try {
    const supabase = await createServerComponentClient();

    if (contractIds.length === 0) {
      return {data: [], error: null, isError: false};
    }

    // Primeiro, garantir que reuniões passadas sejam atualizadas
    await markPastMeetingsAsCompleted(contractIds);

    const {data, error} = await supabase
      .from("meetings")
      .select(
        "id, contract_id, title, department, meeting_date, status, google_calendar_event_id, summary, summary_file_url, created_by, created_at, updated_at"
      )
      .in("contract_id", contractIds)
      .in("status", ["completed", "scheduled"])
      .order("meeting_date", {ascending: false})
      .limit(10);

    return handleSupabaseError({data: data || [], error});
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar reuniões",
      isError: true
    };
  }
}

/**
 * Busca serviços de um contrato
 */
export async function getContractServices(
  contractId: string
): Promise<ErrorResult<Service[]>> {
  try {
    const supabase = await createServerComponentClient();

    const {data, error} = await supabase
      .from("services")
      .select("id, contract_id, name, description, type, created_at")
      .eq("contract_id", contractId)
      .order("created_at", {ascending: false});

    return handleSupabaseError({data: data || [], error});
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar serviços",
      isError: true
    };
  }
}

/**
 * Busca todas as reuniões de contratos específicos
 */
export async function getMeetingsByContracts(
  contractIds: string[]
): Promise<ErrorResult<Meeting[]>> {
  try {
    const supabase = await createServerComponentClient();

    if (contractIds.length === 0) {
      return {data: [], error: null, isError: false};
    }

    const {data, error} = await supabase
      .from("meetings")
      .select(
        "id, contract_id, title, department, meeting_date, status, google_calendar_event_id, summary, summary_file_url, created_by, created_at, updated_at"
      )
      .in("contract_id", contractIds)
      .order("meeting_date", {ascending: false});

    return handleSupabaseError({data: data || [], error});
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar reuniões",
      isError: true
    };
  }
}

/**
 * Busca insights (globais ou de contratos específicos)
 */
export async function getInsights(
  contractIds: string[]
): Promise<ErrorResult<Insight[]>> {
  try {
    const supabase = await createServerComponentClient();

    // Insights podem ser globais (contract_id = null) ou específicos
    let query = supabase
      .from("insights")
      .select(
        "id, contract_id, title, description, type, media_url, thumbnail_url, duration, published_at, created_at"
      );

    if (contractIds.length > 0) {
      query = query.or(`contract_id.is.null,contract_id.in.(${contractIds.join(",")})`);
    } else {
      query = query.is("contract_id", null);
    }

    const {data, error} = await query.order("published_at", {ascending: false});

    return handleSupabaseError({data: data || [], error});
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar insights",
      isError: true
    };
  }
}

/**
 * Atualiza reuniÃ£o no banco de dados
 */
export async function updateMeeting(
  meetingId: string,
  updates: {
    meeting_date?: string;
    status?: "scheduled" | "completed" | "cancelled";
    google_calendar_event_id?: string | null;
  }
): Promise<ErrorResult<Meeting>> {
  try {
    const supabase = await createServerComponentClient();

    const {data, error} = await supabase
      .from("meetings")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", meetingId)
      .select(
        "id, contract_id, title, department, meeting_date, status, google_calendar_event_id, summary, summary_file_url, created_by, created_at, updated_at"
      )
      .single();

    return handleSupabaseError({data, error});
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao atualizar reuniÃ£o",
      isError: true
    };
  }
}

/**
 * Busca reuniÃ£o por ID
 */
export async function getMeetingById(
  meetingId: string
): Promise<ErrorResult<Meeting>> {
  try {
    const supabase = await createServerComponentClient();

    const {data, error} = await supabase
      .from("meetings")
      .select(
        "id, contract_id, title, department, meeting_date, status, google_calendar_event_id, summary, summary_file_url, created_by, created_at, updated_at"
      )
      .eq("id", meetingId)
      .single();

    return handleSupabaseError({data, error});
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao buscar reuniÃ£o",
      isError: true
    };
  }
}
