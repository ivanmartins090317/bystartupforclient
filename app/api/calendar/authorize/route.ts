import {NextResponse} from "next/server";
import {getAuthUrl} from "@/lib/google-calendar/auth";

/**
 * Rota para iniciar autenticação Google Calendar
 * GET /api/calendar/authorize
 */
export async function GET() {
  try {
    const authUrl = getAuthUrl();

    return NextResponse.json({authUrl}, {status: 200});
  } catch (error) {
    console.error("Erro ao gerar URL de autorização:", error);
    return NextResponse.json(
      {error: "Erro ao iniciar autenticação"},
      {status: 500}
    );
  }
}
