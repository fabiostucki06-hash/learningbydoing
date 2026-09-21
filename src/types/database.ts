// Generiert via Supabase (generate_typescript_types). Nicht von Hand bearbeiten.
// Nach jeder Schema-Änderung neu generieren.
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
      counters: {
        Row: {
          id: string
          value: number | null
        }
        Insert: {
          id: string
          value?: number | null
        }
        Update: {
          id?: string
          value?: number | null
        }
        Relationships: []
      }
      cards: {
        Row: {
          back: string
          box: number
          created_at: string
          deck_id: string
          due_at: string
          front: string
          id: string
          last_reviewed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          box?: number
          created_at?: string
          deck_id: string
          due_at?: string
          front: string
          id?: string
          last_reviewed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          back?: string
          box?: number
          created_at?: string
          deck_id?: string
          due_at?: string
          front?: string
          id?: string
          last_reviewed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          data: Json
          id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
        }
        Relationships: []
      }
      decks: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          id: string
          mime_type: string
          page_count: number | null
          status: string
          storage_path: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          id?: string
          mime_type?: string
          page_count?: number | null
          status?: string
          storage_path: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          page_count?: number | null
          status?: string
          storage_path?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          created_at: string
          id: string
          starts_at: string
          subject: string
          title: string | null
          topics: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          starts_at: string
          subject: string
          title?: string | null
          topics?: string[]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          starts_at?: string
          subject?: string
          title?: string | null
          topics?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      offerten: {
        Row: {
          data: Json
          id: string
        }
        Insert: {
          data: Json
          id: string
        }
        Update: {
          data?: Json
          id?: string
        }
        Relationships: []
      }
      Offerten: {
        Row: {
          created_at: string
          data: Json | null
          id: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          data: Json
          id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          box_after: number
          box_before: number
          card_id: string
          id: string
          known: boolean
          reviewed_at: string
          reviewed_on: string
          user_id: string
        }
        Insert: {
          box_after: number
          box_before: number
          card_id: string
          id?: string
          known: boolean
          reviewed_at?: string
          reviewed_on?: string
          user_id?: string
        }
        Update: {
          box_after?: number
          box_before?: number
          card_id?: string
          id?: string
          known?: boolean
          reviewed_at?: string
          reviewed_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      rechnungen: {
        Row: {
          data: Json
          id: string
        }
        Insert: {
          data: Json
          id: string
        }
        Update: {
          data?: Json
          id?: string
        }
        Relationships: []
      }
      whitelist: {
        Row: {
          added_by: string | null
          created_at: string | null
          email: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          email: string
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          email?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      study_days: {
        Args: { days?: number }
        Returns: { day: string }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
