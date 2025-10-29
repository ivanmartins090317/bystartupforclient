import {NextResponse} from "next/server";
import {getGoogleCalendarTokensFromDB} from "@/lib/google-calendar/tokens";

/**
 * Rota para verificar se há tokens salvos no banco
 * GET /api/calendar/check-tokens
 */
export async function GET() {
  try {
    const result = await getGoogleCalendarTokensFromDB();

    if (result.isError) {
      return NextResponse.json(
        {
          hasTokens: false,
          error: result.error,
          message: "Nenhum token encontrado no banco de dados"
        },
        {status: 200}
      );
    }

    if (!result.data) {
      return NextResponse.json(
        {
          hasTokens: false,
          message: "Nenhum token encontrado no banco de dados"
        },
        {status: 200}
      );
    }

    const expiryDate = result.data.expiry_date
      ? new Date(result.data.expiry_date)
      : null;
    const isExpired = expiryDate ? expiryDate.getTime() < Date.now() : false;

    return NextResponse.json(
      {
        hasTokens: true,
        expiryDate: expiryDate?.toISOString() || null,
        isExpired,
        hasRefreshToken: !!result.data.refresh_token
      },
      {status: 200}
    );
  } catch (error) {
    return NextResponse.json(
      {
        hasTokens: false,
        error: error instanceof Error ? error.message : "Erro ao verificar tokens"
      },
      {status: 500}
    );
  }
}
