"use client";

import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Calendar, Clock, Download, Eye, Users} from "lucide-react";
import {format, isFuture, isPast, isToday} from "date-fns";
import {ptBR} from "date-fns/locale";
import {Database} from "@/types/database.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type Meeting = Database["public"]["Tables"]["meetings"]["Row"];

interface MeetingsListProps {
  meetings: Meeting[];
}

const departmentLabels = {
  comercial: "Comercial",
  tecnologia: "Tecnologia",
  marketing: "Marketing"
};

const departmentColors = {
  comercial: "bg-blue-100 text-blue-700",
  tecnologia: "bg-purple-100 text-purple-700",
  marketing: "bg-pink-100 text-pink-700"
};

const statusLabels = {
  scheduled: "Agendada",
  completed: "Concluída",
  cancelled: "Cancelada"
};

const statusColors = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

export function MeetingsList({meetings}: MeetingsListProps) {
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");

  const filteredMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.meeting_date);

    // Department filter
    if (departmentFilter !== "all" && meeting.department !== departmentFilter) {
      return false;
    }

    // Period filter
    if (periodFilter === "upcoming" && !isFuture(meetingDate)) {
      return false;
    }
    if (periodFilter === "past" && !isPast(meetingDate)) {
      return false;
    }
    if (periodFilter === "today" && !isToday(meetingDate)) {
      return false;
    }

    return true;
  });

  // Group by upcoming and past
  const upcomingMeetings = filteredMeetings.filter(
    (m) => isFuture(new Date(m.meeting_date)) || isToday(new Date(m.meeting_date))
  );
  const pastMeetings = filteredMeetings.filter(
    (m) => isPast(new Date(m.meeting_date)) && !isToday(new Date(m.meeting_date))
  );

  if (meetings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma reunião encontrada
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            Entre em contato para agendar uma reunião com nossa equipe
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="comercial">Comercial</SelectItem>
            <SelectItem value="tecnologia">Tecnologia</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="upcoming">Próximas</SelectItem>
            <SelectItem value="past">Passadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-secondary-900">
            Próximas Reuniões ({upcomingMeetings.length})
          </h2>
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </div>
      )}

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-secondary-900">
            Reuniões Anteriores ({pastMeetings.length})
          </h2>
          <div className="space-y-3">
            {pastMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </div>
      )}

      {filteredMeetings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            <p>Nenhuma reunião encontrada com os filtros selecionados</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MeetingCard({meeting}: {meeting: Meeting}) {
  const meetingDate = new Date(meeting.meeting_date);
  const isUpcoming = isFuture(meetingDate) || isToday(meetingDate);

  return (
    <Card className={isUpcoming ? "border-primary-200 bg-primary-50/30" : ""}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Title and Badges */}
            <div>
              <h3 className="font-semibold text-secondary-900 text-lg mb-2">
                {meeting.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={departmentColors[meeting.department]}>
                  <Users className="h-3 w-3 mr-1" />
                  {departmentLabels[meeting.department]}
                </Badge>
                <Badge className={statusColors[meeting.status]}>
                  {statusLabels[meeting.status]}
                </Badge>
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(meetingDate, "dd 'de' MMMM 'de' yyyy", {locale: ptBR})}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{format(meetingDate, "HH:mm", {locale: ptBR})}</span>
              </div>
            </div>

            {/* Summary Preview */}
            {meeting.summary && meeting.status === "completed" && (
              <p className="text-sm text-gray-600 line-clamp-2 pt-2 border-t">
                {meeting.summary}
              </p>
            )}
          </div>

          {/* Actions */}
          {meeting.status === "completed" && meeting.summary && (
            <div className="flex sm:flex-col gap-2">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Eye className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Visualizar</span>
              </Button>
              {meeting.summary_file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1 sm:flex-none"
                >
                  <a
                    href={meeting.summary_file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
