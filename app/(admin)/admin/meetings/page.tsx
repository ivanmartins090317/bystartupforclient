import {createServiceClient} from "@/lib/supabase/service";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {DEPARTMENT_LABELS} from "@/types";

interface MeetingListItem {
  id: string;
  title: string;
  department: "comercial" | "tecnologia" | "marketing";
  meeting_date: string;
  status: "scheduled" | "completed" | "cancelled";
  contracts: {
    contract_number: string;
    title: string;
    companies: {
      name: string;
    } | null;
  } | null;
}

export default async function AdminMeetingsPage() {
  const supabase = createServiceClient();

  // Buscar todas as reuniões agendadas e recentes
  const {data: meetings} = await supabase
    .from("meetings")
    .select(
      "id, title, department, meeting_date, status, contracts(contract_number, title, companies(name))"
    )
    .in("status", ["scheduled", "completed"])
    .order("meeting_date", {ascending: false})
    .limit(50)
    .returns<MeetingListItem[]>();

  const scheduledMeetings = (meetings || []).filter((m) => m.status === "scheduled");
  const completedMeetings = (meetings || []).filter((m) => m.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reuniões</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie reuniões agendadas com os clientes
          </p>
        </div>
        <Link href="/admin/meetings/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Reunião
          </Button>
        </Link>
      </div>

      {/* Reuniões Agendadas */}
      {scheduledMeetings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Agendadas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scheduledMeetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardHeader>
                  <CardTitle className="text-base">{meeting.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Cliente: </span>
                    {meeting.contracts?.companies?.name || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Contrato: </span>
                    {meeting.contracts?.contract_number || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Departamento: </span>
                    {DEPARTMENT_LABELS[meeting.department]}
                  </div>
                  <div>
                    <span className="font-medium">Data: </span>
                    {format(new Date(meeting.meeting_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                      locale: ptBR
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reuniões Concluídas */}
      {completedMeetings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Concluídas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedMeetings.slice(0, 10).map((meeting) => (
              <Card key={meeting.id} className="opacity-75">
                <CardHeader>
                  <CardTitle className="text-base">{meeting.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Cliente: </span>
                    {meeting.contracts?.companies?.name || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Contrato: </span>
                    {meeting.contracts?.contract_number || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Data: </span>
                    {format(new Date(meeting.meeting_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                      locale: ptBR
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!meetings || meetings.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Nenhuma reunião encontrada. Crie uma nova reunião para começar.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

