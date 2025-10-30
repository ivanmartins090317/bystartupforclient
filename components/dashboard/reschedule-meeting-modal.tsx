"use client";

import {useState, useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Calendar, Clock, CheckCircle, RefreshCw} from "lucide-react";
import {rescheduleMeeting} from "@/lib/actions/meetings";
import {toast} from "sonner";
import type {Meeting} from "@/types";
import {format, addDays, startOfDay, endOfDay} from "date-fns";
import {ptBR} from "date-fns/locale";

interface RescheduleMeetingModalProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface TimeSlotSuggestion {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  available: boolean;
  label: string; // "Hoje", "Amanhã", "Segunda-feira", etc.
  dateTimeISO: string; // ISO string completa
}

export function RescheduleMeetingModal({
  meeting,
  open,
  onOpenChange,
  onSuccess
}: RescheduleMeetingModalProps) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlotSuggestion[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Inicializar valores quando modal abrir
  function handleOpenChange(open: boolean) {
    if (open && meeting) {
      const meetingDate = new Date(meeting.meeting_date);
      setNewDate(meetingDate.toISOString().split("T")[0]);
      setNewTime(meetingDate.toTimeString().slice(0, 5));
      setSelectedSlot(null);
      // Carregar horários disponíveis
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
    onOpenChange(open);
  }

  /**
   * Carrega horários disponíveis do Google Calendar
   */
  async function loadAvailableSlots() {
    setIsLoadingSlots(true);
    try {
      const startDate = startOfDay(new Date());
      const endDate = endOfDay(addDays(new Date(), 14)); // próximos 14 dias

      const response = await fetch(
        `/api/calendar/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&duration=60`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.availableSlots && Array.isArray(data.availableSlots)) {
          const suggestions: TimeSlotSuggestion[] = data.availableSlots
            .slice(0, 18) // Limitar a 18 sugestões
            .map((slot: {start: string; end: string; available: boolean}) => {
              const start = new Date(slot.start);
              return {
                date: format(start, "yyyy-MM-dd"),
                time: format(start, "HH:mm"),
                available: slot.available,
                label: getDateLabel(start),
                dateTimeISO: slot.start
              };
            });

          setAvailableSlots(suggestions);
        } else {
          setAvailableSlots([]);
          // Não mostrar erro se estiver configurado mas sem horários disponíveis
          if (response.status !== 503) {
            toast.info("Nenhum horário disponível encontrado nos próximos dias");
          }
        }
      } else {
        const errorData = await response.json();
        if (response.status === 503) {
          // Google Calendar não configurado - não é erro crítico
          setAvailableSlots([]);
        } else {
          toast.error(errorData.error || "Erro ao carregar horários disponíveis");
          setAvailableSlots([]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar slots:", error);
      // Não mostrar toast em caso de erro de rede/parse
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }

  /**
   * Gera label amigável para a data
   */
  function getDateLabel(date: Date): string {
    const today = new Date();
    const tomorrow = addDays(today, 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Hoje";
    } else if (format(date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")) {
      return "Amanhã";
    } else {
      return format(date, "EEEE", {locale: ptBR});
    }
  }

  /**
   * Seleciona um slot disponível
   */
  function handleSlotSelect(slot: TimeSlotSuggestion) {
    if (!slot.available) return;

    const dateTime = new Date(slot.dateTimeISO);
    setNewDate(format(dateTime, "yyyy-MM-dd"));
    setNewTime(format(dateTime, "HH:mm"));
    setSelectedSlot(slot.dateTimeISO);
  }

  async function handleReschedule() {
    if (!meeting || !newDate || !newTime) {
      toast.error("Preencha data e horário");
      return;
    }

    setIsRescheduling(true);

    try {
      // Combinar data e hora em ISO string
      const combinedDateTime = new Date(`${newDate}T${newTime}:00`);
      const isoString = combinedDateTime.toISOString();

      const result = await rescheduleMeeting(meeting.id, isoString);

      if (result.success) {
        toast.success("Reunião reagendada com sucesso!", {
          description: `Reagendada para ${format(
            combinedDateTime,
            "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
            {locale: ptBR}
          )}`
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error("Erro ao reagendar reunião", {
          description: result.error
        });
      }
    } catch (error) {
      toast.error("Erro inesperado ao reagendar reunião");
      console.error(error);
    } finally {
      setIsRescheduling(false);
    }
  }

  if (!meeting) {
    return null;
  }

  const meetingDate = new Date(meeting.meeting_date);
  const minDate = new Date().toISOString().split("T")[0]; // Data mÃ­nima: hoje

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reagendar Reunião
          </DialogTitle>
          <DialogDescription>
            Selecione uma nova data e horário para a reunião{" "}
            <span className="font-semibold text-secondary-900">"{meeting.title}"</span>.
            Atualmente agendada para{" "}
            <span className="font-semibold text-secondary-900">
              {format(meetingDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR
              })}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Seleção manual */}
          <div className="space-y-4 border-b pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-date">Nova Data</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  min={minDate}
                  disabled={isRescheduling}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-time">Novo Horário</Label>
                <Input
                  id="new-time"
                  type="time"
                  value={newTime}
                  onChange={(e) => {
                    setNewTime(e.target.value);
                    setSelectedSlot(null);
                  }}
                  disabled={isRescheduling}
                />
              </div>
            </div>
          </div>

          {/* Sugestões de horários disponíveis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Horários Disponíveis (próximos 14 dias)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAvailableSlots}
                disabled={isLoadingSlots || isRescheduling}
                className="h-8"
              >
                <RefreshCw
                  className={`h-3 w-3 mr-2 ${isLoadingSlots ? "animate-spin" : ""}`}
                />
                {isLoadingSlots ? "Carregando..." : "Atualizar"}
              </Button>
            </div>

            {isLoadingSlots ? (
              <div className="text-center py-8 text-sm text-gray-500">
                <Clock className="h-5 w-5 mx-auto mb-2 animate-pulse" />
                <p>Consultando calendário do administrador...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                {availableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={selectedSlot === slot.dateTimeISO ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSlotSelect(slot)}
                    disabled={isRescheduling || !slot.available}
                    className={`flex items-center gap-2 h-auto py-2 ${
                      selectedSlot === slot.dateTimeISO ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {slot.available && (
                      <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                    )}
                    <span className="text-xs text-left">
                      <span className="font-medium">{slot.label}</span>
                      <br />
                      <span className="text-gray-600">{slot.time}</span>
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-gray-500 border rounded-lg bg-gray-50">
                <Calendar className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                <p>Nenhum horário disponível encontrado</p>
                <p className="text-xs text-gray-400 mt-1">
                  O Google Calendar pode não estar configurado ou não há horários livres
                  nos próximos dias
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isRescheduling}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={isRescheduling || !newDate || !newTime}
            className="w-full sm:w-auto"
          >
            {isRescheduling ? "Reagendando..." : "Confirmar Reagendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
