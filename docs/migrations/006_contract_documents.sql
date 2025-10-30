-- contract_documents: documentos versionáveis dos contratos

create table if not exists public.contract_documents (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size bigint not null,
  mime_type text not null default 'application/pdf',
  published_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz default now()
);

alter table public.contract_documents enable row level security;

-- Cliente pode ler apenas documentos publicados do seu contrato
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'contract_documents' and policyname = 'read published docs of own contracts'
  ) then
    create policy "read published docs of own contracts"
    on public.contract_documents for select
    to authenticated
    using (
      published_at is not null and
      contract_id in (
        select c.id from public.contracts c
        join public.profiles p on p.company_id = c.company_id
        where p.id = auth.uid()
      )
    );
  end if;
end $$;


