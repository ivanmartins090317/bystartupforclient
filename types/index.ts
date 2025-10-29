import type {Database} from "./database.types";

/**
 * 📘 TIPOS COMPARTILHADOS
 *
 * Tipos derivados do schema do Supabase para uso em toda a aplicação.
 * Centraliza tipos de joins, interfaces compartilhadas e constants tipadas.
 */

// ==========================================
// TIPOS BASE DO BANCO DE DADOS
// ==========================================

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Contract = Database["public"]["Tables"]["contracts"]["Row"];
export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Insight = Database["public"]["Tables"]["insights"]["Row"];

// ==========================================
// TIPOS PARA QUERIES COM JOINS
// ==========================================

/**
 * Perfil com empresa (join)
 */
export interface ProfileWithCompany extends Profile {
  companies: Company | null;
}

/**
 * Contrato com serviços (join)
 */
export interface ContractWithServices extends Contract {
  services: Service[];
}

// ==========================================
// ENUMS TIPADOS E CONSTANTES
// ==========================================

/**
 * Status de contrato
 */
export const CONTRACT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive"
} as const;

export type ContractStatus = (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS];

/**
 * Status de reunião
 */
export const MEETING_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
} as const;

export type MeetingStatus = (typeof MEETING_STATUS)[keyof typeof MEETING_STATUS];

/**
 * Departamento
 */
export const DEPARTMENT = {
  COMERCIAL: "comercial",
  TECNOLOGIA: "tecnologia",
  MARKETING: "marketing"
} as const;

export type Department = (typeof DEPARTMENT)[keyof typeof DEPARTMENT];

/**
 * Tipo de serviço
 */
export const SERVICE_TYPE = {
  ASSESSORIA: "assessoria",
  DESENVOLVIMENTO: "desenvolvimento",
  LANDING_PAGE: "landing_page",
  SOFTWARE: "software"
} as const;

export type ServiceType = (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE];

/**
 * Tipo de insight
 */
export const INSIGHT_TYPE = {
  PODCAST: "podcast",
  VIDEO: "video"
} as const;

export type InsightType = (typeof INSIGHT_TYPE)[keyof typeof INSIGHT_TYPE];

/**
 * Role do usuário
 */
export const USER_ROLE = {
  CLIENT: "client",
  ADMIN: "admin"
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// ==========================================
// LABELS E CORES (CONSTANTES TIPADAS)
// ==========================================

/**
 * Labels para status de contrato
 */
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  [CONTRACT_STATUS.ACTIVE]: "Ativo",
  [CONTRACT_STATUS.INACTIVE]: "Inativo"
} as const;

/**
 * Labels para status de reunião
 */
export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  [MEETING_STATUS.SCHEDULED]: "Agendada",
  [MEETING_STATUS.COMPLETED]: "Concluída",
  [MEETING_STATUS.CANCELLED]: "Cancelada"
} as const;

/**
 * Labels para departamento
 */
export const DEPARTMENT_LABELS: Record<Department, string> = {
  [DEPARTMENT.COMERCIAL]: "Comercial",
  [DEPARTMENT.TECNOLOGIA]: "Tecnologia",
  [DEPARTMENT.MARKETING]: "Marketing"
} as const;

/**
 * Labels para tipo de serviço
 */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [SERVICE_TYPE.ASSESSORIA]: "Assessoria",
  [SERVICE_TYPE.DESENVOLVIMENTO]: "Desenvolvimento",
  [SERVICE_TYPE.LANDING_PAGE]: "Landing Page",
  [SERVICE_TYPE.SOFTWARE]: "Software"
} as const;

/**
 * Labels para tipo de insight
 */
export const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  [INSIGHT_TYPE.PODCAST]: "Podcast",
  [INSIGHT_TYPE.VIDEO]: "Vídeo"
} as const;

// ==========================================
// TYPE GUARDS
// ==========================================

/**
 * Verifica se é status de contrato válido
 */
export function isContractStatus(value: string): value is ContractStatus {
  return Object.values(CONTRACT_STATUS).includes(value as ContractStatus);
}

/**
 * Verifica se é status de reunião válido
 */
export function isMeetingStatus(value: string): value is MeetingStatus {
  return Object.values(MEETING_STATUS).includes(value as MeetingStatus);
}

/**
 * Verifica se é departamento válido
 */
export function isDepartment(value: string): value is Department {
  return Object.values(DEPARTMENT).includes(value as Department);
}

/**
 * Verifica se é tipo de serviço válido
 */
export function isServiceType(value: string): value is ServiceType {
  return Object.values(SERVICE_TYPE).includes(value as ServiceType);
}

/**
 * Verifica se é tipo de insight válido
 */
export function isInsightType(value: string): value is InsightType {
  return Object.values(INSIGHT_TYPE).includes(value as InsightType);
}

// ==========================================
// TIPOS PARA FILTROS
// ==========================================

/**
 * Filtros de status
 */
export type StatusFilter = ContractStatus | "all";

/**
 * Filtros de departamento
 */
export type DepartmentFilter = Department | "all";

/**
 * Filtros de período de reunião
 */
export type PeriodFilter = "all" | "today" | "upcoming" | "past";

/**
 * Filtros de tipo de insight
 */
export type InsightFilter = InsightType | "all";
