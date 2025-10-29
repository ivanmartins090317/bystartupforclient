import {NextResponse} from "next/server";
import {saveGoogleCalendarTokens} from "@/lib/google-calendar/tokens";
import {getUserProfile} from "@/lib/supabase/helpers";
import type {GoogleCalendarAuthTokens} from "@/lib/google-calendar/types";

/**
 * Rota para migrar tokens das variáveis de ambiente para o banco de dados
 * GET /api/calendar/migrate-tokens
 * 
 * Esta rota lê os tokens do .env.local e salva no banco.
 * Útil para migração da Fase 4 para Fase 5.
 */
export async function GET() {
  try {
    // Verificar se é admin
    const profileResult = await getUserProfile();

    if (profileResult.isError || !profileResult.data) {
      return NextResponse.json(
        {error: "Usuário não autenticado"},
        {status: 401}
      );
    }

    const profile = profileResult.data;

    if (profile.role !== "admin") {
      return NextResponse.json(
        {error: "Apenas administradores podem migrar tokens"},
        {status: 403}
      );
    }

    // Buscar tokens das variáveis de ambiente
    const accessToken = process.env.GOOGLE_TEST_ACCESS_TOKEN;
    const refreshToken = process.env.GOOGLE_TEST_REFRESH_TOKEN;
    const expiryDateStr = process.env.GOOGLE_TEST_EXPIRY_DATE;

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Tokens não encontrados nas variáveis de ambiente",
          message:
            "Verifique se GOOGLE_TEST_ACCESS_TOKEN está definido no .env.local"
        },
        {status: 400}
      );
    }

    // Preparar tokens para salvar
    const tokens: GoogleCalendarAuthTokens = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDateStr
        ? Number.parseInt(expiryDateStr, 10)
        : undefined
    };

    // Salvar no banco
    const saveResult = await saveGoogleCalendarTokens(profile.id, tokens);

    if (saveResult.isError) {
      return NextResponse.json(
        {
          error: "Erro ao salvar tokens no banco",
          details: saveResult.error
        },
        {status: 500}
      );
    }

    const expiryDate = tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : "Não definido";

    return NextResponse.json(
      {
        success: true,
        message: "Tokens migrados com sucesso do .env.local para o banco de dados",
        adminEmail: profile.email,
        tokenId: saveResult.data?.id,
        expiryDate,
        hasRefreshToken: !!refreshToken,
        note: "Os tokens agora são obtidos automaticamente do banco de dados"
      },
      {status: 200}
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao migrar tokens",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      {status: 500}
    );
  }
}
