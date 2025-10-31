"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Calendar, Clock, Users, Save, Trash2, CalendarDays} from "lucide-react";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import type {Meeting} from "@/types";
import {DEPARTMENT_LABELS} from "@/types";
import {EmptyState} from "@/components/shared/empty-state";
import {toast} from "sonner";
import {saveMeetingToGoogleCalendar} from "@/lib/actions/meetings";
import {DeleteMeetingModal} from "./delete-meeting-modal";
import {RescheduleMeetingModal} from "./reschedule-meeting-modal";

interface NextMeetingCardProps {
  meeting: Meeting | null;
}

const departmentColors: Record<string, string> = {
  comercial: "bg-blue-100 text-blue-700",
  tecnologia: "bg-purple-100 text-purple-700",
  marketing: "bg-pink-100 text-pink-700"
};

export function NextMeetingCard({meeting}: NextMeetingCardProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  async function handleSave() {
    if (!meeting) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveMeetingToGoogleCalendar(meeting.id);

      if (result.success) {
        toast.success("Reunião salva no Google Calendar com sucesso!");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao salvar reunião");
      }
    } catch (error) {
      toast.error("Erro inesperado ao salvar reunião");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  function handleRefresh() {
    router.refresh();
  }

  if (!meeting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próxima Reunião
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Calendar}
            title="Nenhuma reunião agendada"
            description="Entre em contato com nossa equipe para agendar uma reunião"
            variant="compact"
            withCard={false}
          />
        </CardContent>
      </Card>
    );
  }

  const meetingDate = new Date(meeting.meeting_date);
  const isSavedInCalendar = !!meeting.google_calendar_event_id;

  return (
    <>
      <Card className="border-accent-200 bg-primary-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            Próxima Reunião
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-secondary-900 text-lg mb-2">
              {meeting.title}
            </h3>
            <Badge className={departmentColors[meeting.department]}>
              <Users className="h-3 w-3 mr-1" />
              {DEPARTMENT_LABELS[meeting.department]}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                {format(meetingDate, "dd 'de' MMMM 'de' yyyy", {locale: ptBR})}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                {format(meetingDate, "HH:mm", {locale: ptBR})}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
            <Button
              variant={isSavedInCalendar ? "outline" : "default"}
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isSavedInCalendar}
              className="flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving
                ? "Salvando na agenda..."
                : isSavedInCalendar
                ? "Aceitar"
                : "Aceitar"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setRescheduleModalOpen(true)}
              className="flex-1 sm:flex-none bg-none"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Reagendar
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="flex-1 sm:flex-none text-red-400 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteMeetingModal
        meeting={meeting}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onSuccess={handleRefresh}
      />

      <RescheduleMeetingModal
        meeting={meeting}
        open={rescheduleModalOpen}
        onOpenChange={setRescheduleModalOpen}
        onSuccess={handleRefresh}
      />
    </>
  );
}
