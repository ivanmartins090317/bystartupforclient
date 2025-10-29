import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Calendar, Download, Eye, FileText} from "lucide-react";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import Link from "next/link";
import type {Meeting} from "@/types";
import {DEPARTMENT_LABELS, MEETING_STATUS_LABELS} from "@/types";

interface RecentMeetingsCardProps {
  meetings: Meeting[];
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

export function RecentMeetingsCard({meetings}: RecentMeetingsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Últimas Reuniões
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/reunioes">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma reunião registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-secondary-900 truncate">
                    {meeting.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {DEPARTMENT_LABELS[meeting.department]}
                    </Badge>
                    <Badge className={`text-xs ${statusColors[meeting.status]}`}>
                      {MEETING_STATUS_LABELS[meeting.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {format(new Date(meeting.meeting_date), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR
                    })}
                  </p>
                </div>

                {meeting.status === "completed" && meeting.summary && (
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {meeting.summary_file_url && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                        <a
                          href={meeting.summary_file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
