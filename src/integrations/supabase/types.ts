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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      policies: {
        Row: {
          additional_insured_email: string | null
          additional_insured_name: string | null
          additional_insured_type: string | null
          address: string
          annual_premium: number
          construction_type: string | null
          created_at: string
          effective_date: string
          expiry_date: string
          heating_type: string | null
          id: string
          insured_email: string
          insured_first_name: string
          insured_last_name: string
          insured_phone: string | null
          liability_limit: string | null
          mailing_address: string | null
          monthly_premium: number
          payment_last_four: string | null
          payment_method: string | null
          policy_number: string
          property_type: string | null
          rental_income_limit: number | null
          replacement_cost: number | null
          roof_type: string | null
          sqft: number | null
          status: string
          tier: string
          units: number | null
          updated_at: string
          user_id: string
          year_built: number | null
        }
        Insert: {
          additional_insured_email?: string | null
          additional_insured_name?: string | null
          additional_insured_type?: string | null
          address: string
          annual_premium: number
          construction_type?: string | null
          created_at?: string
          effective_date: string
          expiry_date: string
          heating_type?: string | null
          id?: string
          insured_email: string
          insured_first_name: string
          insured_last_name: string
          insured_phone?: string | null
          liability_limit?: string | null
          mailing_address?: string | null
          monthly_premium: number
          payment_last_four?: string | null
          payment_method?: string | null
          policy_number: string
          property_type?: string | null
          rental_income_limit?: number | null
          replacement_cost?: number | null
          roof_type?: string | null
          sqft?: number | null
          status?: string
          tier: string
          units?: number | null
          updated_at?: string
          user_id: string
          year_built?: number | null
        }
        Update: {
          additional_insured_email?: string | null
          additional_insured_name?: string | null
          additional_insured_type?: string | null
          address?: string
          annual_premium?: number
          construction_type?: string | null
          created_at?: string
          effective_date?: string
          expiry_date?: string
          heating_type?: string | null
          id?: string
          insured_email?: string
          insured_first_name?: string
          insured_last_name?: string
          insured_phone?: string | null
          liability_limit?: string | null
          mailing_address?: string | null
          monthly_premium?: number
          payment_last_four?: string | null
          payment_method?: string | null
          policy_number?: string
          property_type?: string | null
          rental_income_limit?: number | null
          replacement_cost?: number | null
          roof_type?: string | null
          sqft?: number | null
          status?: string
          tier?: string
          units?: number | null
          updated_at?: string
          user_id?: string
          year_built?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
