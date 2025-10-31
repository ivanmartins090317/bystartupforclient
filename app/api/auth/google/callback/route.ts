import {NextRequest, NextResponse} from "next/server";
import {getTokensFromCode} from "@/lib/google-calendar/auth";
import {saveGoogleCalendarTokens} from "@/lib/google-calendar/tokens";
import {getUserProfile} from "@/lib/supabase/helpers";

/**
 * Callback do OAuth Google Calendar
 * GET /api/auth/google/callback?code=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/dashboard?error=calendar_auth_failed", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard?error=no_code", request.url)
    );
  }

  try {
    // Verificar se é admin
    const profileResult = await getUserProfile();

    if (profileResult.isError || !profileResult.data) {
      return NextResponse.redirect(
        new URL("/dashboard?error=not_authenticated", request.url)
      );
    }

    const profile = profileResult.data;

    if (profile.role !== "admin") {
      return NextResponse.redirect(
        new URL("/dashboard?error=unauthorized", request.url)
      );
    }

    // Obter tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL("/dashboard?error=no_access_token", request.url)
      );
    }

    // Salvar tokens no banco de dados
    const saveResult = await saveGoogleCalendarTokens(profile.id, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? undefined,
      expiry_date: tokens.expiry_date ?? undefined
    });

    if (saveResult.isError) {
      console.error("Erro ao salvar tokens no banco:", saveResult.error);
      return NextResponse.redirect(
        new URL("/dashboard?error=token_save_failed", request.url)
      );
    }

    console.log(
      "\n=== TOKENS SALVOS NO BANCO ===",
      `Admin: ${profile.email}`,
      `Token ID: ${saveResult.data?.id}`,
      `Expira em: ${
        tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : "Não definido"
      }`,
      "========================\n"
    );

    return NextResponse.redirect(
      new URL("/dashboard?success=calendar_connected", request.url)
    );
  } catch (error) {
    console.error("Erro no callback OAuth:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=token_exchange_failed", request.url)
    );
  }
}
