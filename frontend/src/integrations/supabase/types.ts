export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string | null
          date: string
          doctor_name: string
          id: string
          notes: string | null
          patient_name: string
          status: string
          time: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          doctor_name: string
          id?: string
          notes?: string | null
          patient_name: string
          status: string
          time: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          doctor_name?: string
          id?: string
          notes?: string | null
          patient_name?: string
          status?: string
          time?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          availability: string
          contact: string
          created_at: string | null
          description: string | null
          experience: number
          id: string
          location: string
          name: string
          rating: number
          specialization: string
          updated_at: string | null
        }
        Insert: {
          availability: string
          contact: string
          created_at?: string | null
          description?: string | null
          experience?: number
          id?: string
          location: string
          name: string
          rating?: number
          specialization: string
          updated_at?: string | null
        }
        Update: {
          availability?: string
          contact?: string
          created_at?: string | null
          description?: string | null
          experience?: number
          id?: string
          location?: string
          name?: string
          rating?: number
          specialization?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string | null
          doctor_recommendation: Json | null
          id: string
          is_user: boolean
          text: string
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_recommendation?: Json | null
          id?: string
          is_user?: boolean
          text: string
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_recommendation?: Json | null
          id?: string
          is_user?: boolean
          text?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          age: number
          condition: string
          contact: string
          created_at: string | null
          gender: string
          id: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          age: number
          condition: string
          contact: string
          created_at?: string | null
          gender: string
          id?: string
          name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          age?: number
          condition?: string
          contact?: string
          created_at?: string | null
          gender?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          created_at: string | null
          date: string
          doctor_id: string | null
          doctor_name: string
          end_time: string
          id: string
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          doctor_id?: string | null
          doctor_name: string
          end_time: string
          id?: string
          start_time: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          doctor_id?: string | null
          doctor_name?: string
          end_time?: string
          id?: string
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_notes: {
        Row: {
          ai_analysis: Json | null
          created_at: string | null
          duration: string
          id: string
          name: string
          status: string
          transcription: string | null
          updated_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string | null
          duration: string
          id?: string
          name: string
          status: string
          transcription?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string | null
          duration?: string
          id?: string
          name?: string
          status?: string
          transcription?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
