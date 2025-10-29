import {createServerComponentClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Users, FileText, Calendar, Lightbulb} from "lucide-react";

export default async function AdminPage() {
  const supabase = await createServerComponentClient();

  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar se é admin
  const {data: profile} = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  // Buscar estatísticas
  const [
    {count: companiesCount},
    {count: contractsCount},
    {count: meetingsCount},
    {count: insightsCount}
  ] = await Promise.all([
    supabase.from("companies").select("*", {count: "exact", head: true}),
    supabase.from("contracts").select("*", {count: "exact", head: true}),
    supabase.from("meetings").select("*", {count: "exact", head: true}),
    supabase.from("insights").select("*", {count: "exact", head: true})
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Painel Administrativo</h1>
        <p className="text-gray-600 mt-2">
          Gerencie clientes, contratos, reuniões e insights
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companiesCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reuniões</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetingsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insightsCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Funcionalidades em Desenvolvimento
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            O painel administrativo completo estará disponível na próxima fase do projeto.
            Funcionalidades planejadas:
          </p>
          <ul className="text-sm text-gray-600 mt-4 space-y-2 text-left">
            <li>• Gerenciamento de clientes e usuários</li>
            <li>• Cadastro e edição de contratos</li>
            <li>• Agendamento e gestão de reuniões</li>
            <li>• Upload de resumos de reuniões</li>
            <li>• Publicação de insights (podcasts e vídeos)</li>
            <li>• Gestão de solicitações de suporte</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
