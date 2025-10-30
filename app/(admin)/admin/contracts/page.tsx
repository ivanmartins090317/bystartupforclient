import {createServiceClient} from "@/lib/supabase/service";
import Link from "next/link";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {DeleteContractButton} from "@/components/admin/contracts/delete-contract-button";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminContractsPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    company?: string;
    page?: string;
    pageSize?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  const supabase = createServiceClient();

  interface AdminContractListItem {
    id: string;
    contract_number: string;
    title: string;
    status: "active" | "inactive";
    signed_date: string;
    companies: {name: string} | null;
  }

  const sp = await searchParams;
  const q = (Array.isArray(sp?.q) ? sp?.q[0] : sp?.q || "").trim();
  const status = (Array.isArray(sp?.status) ? sp?.status[0] : sp?.status || "").trim();
  const company = (
    Array.isArray(sp?.company) ? sp?.company[0] : sp?.company || ""
  ).trim();
  const page = Math.max(
    1,
    parseInt(Array.isArray(sp?.page) ? sp?.page[0] : sp?.page || "1", 10) || 1
  );
  const pageSize = Math.min(
    50,
    Math.max(
      5,
      parseInt(
        Array.isArray(sp?.pageSize) ? sp?.pageSize[0] : sp?.pageSize || "10",
        10
      ) || 10
    )
  );
  const sort = (Array.isArray(sp?.sort) ? sp?.sort[0] : sp?.sort || "signed_date").trim();
  const dir = (
    (Array.isArray(sp?.dir) ? sp?.dir[0] : sp?.dir || "desc").trim() === "asc"
      ? "asc"
      : "desc"
  ) as "asc" | "desc";

  let query = supabase
    .from("contracts")
    .select(
      "id, company_id, contract_number, title, status, signed_date, companies(name), contract_documents(id, published_at)",
      {count: "exact"}
    )
    .order(
      sort === "title" || sort === "status" || sort === "signed_date"
        ? sort
        : "signed_date",
      {ascending: dir === "asc"}
    );

  if (status === "active" || status === "inactive") {
    query = query.eq("status", status as "active" | "inactive");
  }
  if (company) {
    query = query.eq("company_id", company);
  }
  if (q) {
    const isNumber = /^\d[\d.-]*$/.test(q);
    query = query.or(
      isNumber
        ? `contract_number.ilike.%${q}%,title.ilike.%${q}%`
        : `title.ilike.%${q}%,contract_number.ilike.%${q}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const {data: contracts, count} = await query.range(from, to).returns<
    (AdminContractListItem & {
      contract_documents?: {id: string; published_at: string | null}[];
    })[]
  >();

  // Empresas para popular filtro "company"
  const {data: companies} = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold shrink-0 border">Contratos</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="w-full">
          <form
            className="flex flex-wrap items-center gap-2"
            action="/admin/contracts"
            method="get"
          >
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar (título ou nº)"
              className="h-9 w-full md:w-64 rounded-md border px-3 text-sm"
            />
            <select
              name="company"
              defaultValue={company || ""}
              className="h-9 w-full md:w-auto md:min-w-[160px] rounded-md border px-2 text-sm"
            >
              <option value="">Todas empresas</option>
              {(companies || []).map((co) => (
                <option key={co.id} value={co.id}>
                  {co.name}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={status || ""}
              className="h-9 w-full md:w-auto md:min-w-[140px] rounded-md border px-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            {/* <select
              name="sort"
              defaultValue={sort}
              className="h-9 w-full md:w-auto md:min-w-[140px] rounded-md border px-2 text-sm"
            >
              <option value="signed_date">Data</option>
              <option value="title">Título</option>
              <option value="status">Status</option>
            </select>
            <select
              name="dir"
              defaultValue={dir}
              className="h-9 w-full md:w-auto md:min-w-[110px] rounded-md border px-2 text-sm"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
            <select
              name="pageSize"
              defaultValue={String(pageSize)}
              className="h-9 w-full md:w-auto md:min-w-[100px] rounded-md border px-2 text-sm"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select> */}
            <Button type="submit" variant="outline" className="h-9 w-full md:w-auto">
              Filtrar
            </Button>
            <Link
              href="/admin/contracts"
              className="h-9 w-full md:w-auto inline-flex items-center justify-center rounded-md border px-3 text-sm"
            >
              Limpar
            </Link>
            <div className="mt-2 md:mt-0 flex md:justify-end">
              <Button variant="outline" asChild className="w-full md:w-auto">
                <Link href="/admin/contracts/new">Novo contrato</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {(contracts || []).map(
              (
                c: AdminContractListItem & {
                  contract_documents?: {id: string; published_at: string | null}[];
                }
              ) => {
                const hasPublished =
                  c.contract_documents?.some((d) => d.published_at) ?? false;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {c.title}{" "}
                        {hasPublished && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            PDF publicado
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {c.contract_number} • {c.companies?.name || "-"} • {c.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/admin/contracts/${c.id}`}>Editar</Link>
                      </Button>
                      <DeleteContractButton id={c.id} title={c.title} />
                    </div>
                  </div>
                );
              }
            )}
            {(!contracts || contracts.length === 0) && (
              <p className="text-sm text-muted-foreground">Nenhum contrato encontrado.</p>
            )}
          </div>
          {(count || 0) > pageSize && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {Math.min(to + 1, count || 0)} de {count} itens
              </p>
              <div className="flex gap-2">
                <Link
                  className="h-9 inline-flex items-center rounded-md border px-3 text-sm"
                  href={`/admin/contracts?${new URLSearchParams({
                    q,
                    status,
                    company,
                    page: String(Math.max(1, page - 1)),
                    pageSize: String(pageSize),
                    sort,
                    dir
                  }).toString()}`}
                >
                  Anterior
                </Link>
                <Link
                  className="h-9 inline-flex items-center rounded-md border px-3 text-sm"
                  href={`/admin/contracts?${new URLSearchParams({
                    q,
                    status,
                    company,
                    page: String(page + 1),
                    pageSize: String(pageSize),
                    sort,
                    dir
                  }).toString()}`}
                >
                  Próxima
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
