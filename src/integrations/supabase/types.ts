export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campanhas: {
        Row: {
          cliente_id: string
          consumido_centavos: number
          created_at: string
          id: string
          nome: string
          orcamento_centavos: number
          status: string
          termina_em: string | null
          updated_at: string
        }
        Insert: {
          cliente_id: string
          consumido_centavos?: number
          created_at?: string
          id?: string
          nome: string
          orcamento_centavos?: number
          status?: string
          termina_em?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          consumido_centavos?: number
          created_at?: string
          id?: string
          nome?: string
          orcamento_centavos?: number
          status?: string
          termina_em?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          canais: string[]
          created_at: string
          id: string
          nome: string
          plano: string
          segmento: string
          status: string
          updated_at: string
        }
        Insert: {
          canais?: string[]
          created_at?: string
          id?: string
          nome: string
          plano?: string
          segmento?: string
          status?: string
          updated_at?: string
        }
        Update: {
          canais?: string[]
          created_at?: string
          id?: string
          nome?: string
          plano?: string
          segmento?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      conteudos: {
        Row: {
          agendado_para: string
          cliente_id: string
          created_at: string
          hora: string
          id: string
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          agendado_para: string
          cliente_id: string
          created_at?: string
          hora?: string
          id?: string
          status?: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          agendado_para?: string
          cliente_id?: string
          created_at?: string
          hora?: string
          id?: string
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conteudos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          key: string
          label: string
          parent_key: string | null
          sort_order: number
        }
        Insert: {
          category: string
          key: string
          label: string
          parent_key?: string | null
          sort_order?: number
        }
        Update: {
          category?: string
          key?: string
          label?: string
          parent_key?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      preferencias: {
        Row: {
          alerta_campanha: boolean
          aprovacoes: boolean
          resumo_diario: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          alerta_campanha?: boolean
          aprovacoes?: boolean
          resumo_diario?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          alerta_campanha?: boolean
          aprovacoes?: boolean
          resumo_diario?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          telefone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          telefone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          granted_at: string
          granted_by: string | null
          permission_key: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          permission_key: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          permission_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: { _key: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
