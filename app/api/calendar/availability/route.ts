import {NextRequest, NextResponse} from "next/server";
import {getAvailableTimeSlots} from "@/lib/google-calendar/availability";
import type {GoogleCalendarAuthTokens} from "@/lib/google-calendar/types";

/**
 * API Route para consultar horários disponíveis no Google Calendar
 * GET /api/calendar/availability?startDate=ISO&endDate=ISO&duration=60
 */
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const durationParam = searchParams.get("duration");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        {error: "startDate e endDate são obrigatórios"},
        {status: 400}
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({error: "Datas inválidas"}, {status: 400});
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        {error: "startDate deve ser anterior a endDate"},
        {status: 400}
      );
    }

    const duration = durationParam ? parseInt(durationParam) : 60;

    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json({error: "Duração inválida"}, {status: 400});
    }

    // TODO: Buscar tokens do banco de dados (Fase 5)
    // Por enquanto, retornamos erro informando que precisa configurar
    const tokens: GoogleCalendarAuthTokens | null = null;

    if (!tokens) {
      return NextResponse.json(
        {
          error: "Google Calendar não configurado",
          message: "O administrador precisa configurar o Google Calendar primeiro"
        },
        {status: 503}
      );
    }

    const availableSlots = await getAvailableTimeSlots(
      tokens,
      startDate,
      endDate,
      duration
    );

    return NextResponse.json({
      availableSlots,
      count: availableSlots.length
    });
  } catch (error) {
    console.error("Erro ao consultar disponibilidade:", error);
    return NextResponse.json({error: "Erro interno do servidor"}, {status: 500});
  }
}
