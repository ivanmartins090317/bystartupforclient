import {createServerComponentClient} from "@/lib/supabase/server";
import {createServiceClient} from "@/lib/supabase/service";
import Link from "next/link";
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

  // Últimos contratos (cross-empresa)
  const svc = createServiceClient();
  interface LatestContractListItem {
    id: string;
    contract_number: string;
    title: string;
    status: "active" | "inactive";
    companies: {name: string} | null;
  }
  const {data: latestContracts} = await svc
    .from("contracts")
    .select("id, contract_number, title, status, signed_date, companies(name)")
    .returns<LatestContractListItem[]>()
    .order("signed_date", {ascending: false})
    .limit(5);

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

      {/* Últimos contratos */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base">Últimos contratos</CardTitle>
          <Link className="text-sm underline" href="/admin/contracts">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {(latestContracts || []).map((c) => (
              <Link
                key={c.id}
                href={`/admin/contracts/${c.id}`}
                className="flex items-center justify-between border rounded-md p-3 hover:bg-muted/30"
              >
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.contract_number} • {c.companies?.name || "-"} • {c.status}
                  </p>
                </div>
              </Link>
            ))}
            {(!latestContracts || latestContracts.length === 0) && (
              <p className="text-sm text-muted-foreground">Nenhum contrato cadastrado.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
