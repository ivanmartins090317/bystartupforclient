"use client";

import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {Calendar, Clock, Download, FileText, Users} from "lucide-react";
import type {Meeting} from "@/types";
import {DEPARTMENT_LABELS, MEETING_STATUS_LABELS} from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
  downloadMeetingSummary,
  generateMeetingSummaryFile,
  generateRandomMeetingSummary
} from "@/lib/meeting-helpers";

interface MeetingSummaryModalProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const departmentColors: Record<string, string> = {
  comercial: "bg-blue-100 text-blue-700",
  tecnologia: "bg-purple-100 text-purple-700",
  marketing: "bg-pink-100 text-pink-700"
};

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

export function MeetingSummaryModal({
  meeting,
  open,
  onOpenChange
}: MeetingSummaryModalProps) {
  if (!meeting) {
    return null;
  }

  const meetingDate = new Date(meeting.meeting_date);

  // Para testes: se não houver resumo, gera um aleatório
  const displaySummary = meeting.summary || generateRandomMeetingSummary(meeting);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{meeting.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 pt-2">
            <Badge className={departmentColors[meeting.department]}>
              <Users className="h-3 w-3 mr-1" />
              {DEPARTMENT_LABELS[meeting.department]}
            </Badge>
            <Badge className={statusColors[meeting.status]}>
              {MEETING_STATUS_LABELS[meeting.status]}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date and Time */}
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{format(meetingDate, "dd 'de' MMMM 'de' yyyy", {locale: ptBR})}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{format(meetingDate, "HH:mm", {locale: ptBR})}</span>
            </div>
          </div>

          {/* Summary */}
          {displaySummary && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-secondary-900">Resumo da Reunião</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {displaySummary}
                </p>
              </div>

              <Separator />

              {/* Document Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-secondary-900">
                    Conteúdo do Arquivo para Download
                  </h3>
                </div>
                <div className="relative">
                  <pre className="text-xs bg-gray-50 border rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto font-mono text-gray-800 whitespace-pre-wrap">
                    {generateMeetingSummaryFile({...meeting, summary: displaySummary})}
                  </pre>
                </div>
                <p className="text-xs text-gray-500 italic">
                  Este é o conteúdo exato que será baixado ao clicar em "Baixar Resumo"
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {displaySummary && (
            <Button
              variant="outline"
              onClick={() =>
                downloadMeetingSummary({...meeting, summary: displaySummary})
              }
              className="w-full sm:w-auto"
            >
              <FileText className="h-4 w-4 mr-2" />
              Baixar Resumo
            </Button>
          )}
          {meeting.summary_file_url && (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <a
                href={meeting.summary_file_url}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Documento
              </a>
            </Button>
          )}
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
