import type {Meeting} from "@/types";

/**
 * Gera um resumo aleatório de reunião para testes
 * Baseado no departamento e título da reunião
 */
export function generateRandomMeetingSummary(meeting: Meeting): string {
  const departmentTemplates: Record<string, string[]> = {
    comercial: [
      "Hoje debatemos sobre melhorias nas estratégias de vendas e prospecção de clientes. Discutimos a implementação de um novo CRM para otimizar o processo comercial e aumentar a taxa de conversão. Ficou definido que iniciaremos a integração na próxima semana.",
      "Reunião focada em análise de performance comercial e métricas de vendas. Revisamos os resultados do último trimestre e definimos metas para o próximo período. Próximos passos: capacitação da equipe e implementação de novas ferramentas.",
      "Discutimos oportunidades de expansão de mercado e novos canais de venda. Analisamos propostas de parcerias estratégicas e definimos prioridades para os próximos meses. A equipe ficou responsável por apresentar plano detalhado na próxima reunião."
    ],
    tecnologia: [
      "Hoje debatemos sobre melhor implementação de uma landing page com os desenvolvedores e tech leaders. Discutimos arquitetura, tecnologias modernas (Next.js, React) e melhores práticas de performance. Definimos cronograma de desenvolvimento e próximos sprints.",
      "Reunião técnica focada em revisão de código e arquitetura do sistema. Discutimos padrões de desenvolvimento, testes automatizados e otimizações de performance. Próximos passos: refatoração de componentes críticos e implementação de CI/CD.",
      "Debatemos sobre a migração para novas tecnologias e melhoria da infraestrutura. Analisamos opções de cloud, escalabilidade e segurança. Decisão: iniciar POC com a arquitetura proposta e apresentar resultados em 30 dias."
    ],
    marketing: [
      "Hoje debatemos estratégias de marketing digital e campanhas para o próximo trimestre. Revisamos métricas de ROI, performance de campanhas e oportunidades de crescimento. Definições: aumentar budget em 50% e focar em canais de maior conversão.",
      "Reunião de planejamento de conteúdo e estratégias de branding. Discutimos linha editorial, calendarização de posts e parcerias com influenciadores. Próximos passos: criação de calendário editorial e definição de KPIs.",
      "Análise de resultados das campanhas de marketing e ajustes estratégicos. Revisamos relatórios de engajamento, conversão e retorno sobre investimento. Decisões: otimizar campanhas de maior performance e testar novos formatos de conteúdo."
    ]
  };

  const templates =
    departmentTemplates[meeting.department] || departmentTemplates.tecnologia;

  // Seleciona um template aleatório baseado no ID da reunião (para consistência)
  const index = meeting.id.charCodeAt(0) % templates.length;

  return templates[index] || templates[0];
}

/**
 * Gera o conteúdo completo do arquivo de texto para download
 */
export function generateMeetingSummaryFile(meeting: Meeting): string {
  const meetingDate = new Date(meeting.meeting_date);

  const fileContent = `
RESUMO DE REUNIÃO
${"=".repeat(50)}

TÍTULO: ${meeting.title}

DATA: ${meetingDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  })} às ${meetingDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  })}

DEPARTAMENTO: ${meeting.department.toUpperCase()}
STATUS: ${meeting.status === "completed" ? "CONCLUÍDA" : meeting.status.toUpperCase()}

${"-".repeat(50)}

RESUMO:

${meeting.summary || "Nenhum resumo disponível para esta reunião."}

${"-".repeat(50)}

Gerado em: ${new Date().toLocaleString("pt-BR")}
`;

  return fileContent.trim();
}

/**
 * Faz download do resumo da reunião como arquivo .txt
 */
export function downloadMeetingSummary(meeting: Meeting): void {
  const content = generateMeetingSummaryFile(meeting);
  const blob = new Blob([content], {type: "text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Nome do arquivo: título da reunião sanitizado + data
  const meetingDate = new Date(meeting.meeting_date);
  const dateStr = meetingDate.toISOString().split("T")[0];
  const fileName = `resumo-${meeting.title
    .toLowerCase()
    .replace(/\s+/g, "-")}-${dateStr}.txt`;

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
