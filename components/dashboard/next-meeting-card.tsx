import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Calendar, Clock, Users} from "lucide-react";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import type {Meeting} from "@/types";
import {DEPARTMENT_LABELS} from "@/types";

interface NextMeetingCardProps {
  meeting: Meeting | null;
}

const departmentColors: Record<string, string> = {
  comercial: "bg-blue-100 text-blue-700",
  tecnologia: "bg-purple-100 text-purple-700",
  marketing: "bg-pink-100 text-pink-700"
};

export function NextMeetingCard({meeting}: NextMeetingCardProps) {
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
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma reunião agendada</p>
            <p className="text-sm mt-1">Entre em contato para agendar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const meetingDate = new Date(meeting.meeting_date);

  return (
    <Card className="border-primary-200 bg-primary-50/50">
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
      </CardContent>
    </Card>
  );
}
