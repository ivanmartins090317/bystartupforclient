export type Json =
  | string
  | number
  | boolean
  | null
  | {[key: string]: Json | undefined}
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          company_id: string;
          role: "client" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          company_id: string;
          role?: "client" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          company_id?: string;
          role?: "client" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          company_id: string;
          contract_number: string;
          title: string;
          description: string | null;
          signed_date: string;
          status: "active" | "inactive";
          contract_file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          contract_number: string;
          title: string;
          description?: string | null;
          signed_date: string;
          status?: "active" | "inactive";
          contract_file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          contract_number?: string;
          title?: string;
          description?: string | null;
          signed_date?: string;
          status?: "active" | "inactive";
          contract_file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contract_documents: {
        Row: {
          id: string;
          contract_id: string;
          storage_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          published_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          storage_path: string;
          file_name: string;
          file_size: number;
          mime_type?: string;
          published_at?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          storage_path?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          published_at?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          contract_id: string;
          name: string;
          description: string | null;
          type: "assessoria" | "desenvolvimento" | "landing_page" | "software";
          created_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          name: string;
          description?: string | null;
          type: "assessoria" | "desenvolvimento" | "landing_page" | "software";
          created_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          name?: string;
          description?: string | null;
          type?: "assessoria" | "desenvolvimento" | "landing_page" | "software";
          created_at?: string;
        };
      };
      meetings: {
        Row: {
          id: string;
          contract_id: string;
          title: string;
          department: "comercial" | "tecnologia" | "marketing";
          meeting_date: string;
          status: "scheduled" | "completed" | "cancelled";
          google_calendar_event_id: string | null;
          summary: string | null;
          summary_file_url: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          title: string;
          department: "comercial" | "tecnologia" | "marketing";
          meeting_date: string;
          status?: "scheduled" | "completed" | "cancelled";
          google_calendar_event_id?: string | null;
          summary?: string | null;
          summary_file_url?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          title?: string;
          department?: "comercial" | "tecnologia" | "marketing";
          meeting_date?: string;
          status?: "scheduled" | "completed" | "cancelled";
          google_calendar_event_id?: string | null;
          summary?: string | null;
          summary_file_url?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      insights: {
        Row: {
          id: string;
          contract_id: string | null;
          title: string;
          description: string | null;
          type: "podcast" | "video";
          media_url: string;
          thumbnail_url: string | null;
          duration: number;
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          contract_id?: string | null;
          title: string;
          description?: string | null;
          type: "podcast" | "video";
          media_url: string;
          thumbnail_url?: string | null;
          duration: number;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string | null;
          title?: string;
          description?: string | null;
          type?: "podcast" | "video";
          media_url?: string;
          thumbnail_url?: string | null;
          duration?: number;
          published_at?: string;
          created_at?: string;
        };
      };
      support_requests: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          subject: string;
          message: string;
          status: "open" | "in_progress" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          subject: string;
          message: string;
          status?: "open" | "in_progress" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          subject?: string;
          message?: string;
          status?: "open" | "in_progress" | "closed";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "client" | "admin";
      contract_status: "active" | "inactive";
      service_type: "assessoria" | "desenvolvimento" | "landing_page" | "software";
      department: "comercial" | "tecnologia" | "marketing";
      meeting_status: "scheduled" | "completed" | "cancelled";
      insight_type: "podcast" | "video";
      request_status: "open" | "in_progress" | "closed";
    };
  };
};
