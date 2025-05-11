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
      bot_configs: {
        Row: {
          chat_frequency: number
          created_at: string
          id: string
          is_active: boolean
          join_frequency: number
          leave_frequency: number
          max_bots: number
          min_bots: number
          updated_at: string
        }
        Insert: {
          chat_frequency?: number
          created_at?: string
          id?: string
          is_active?: boolean
          join_frequency?: number
          leave_frequency?: number
          max_bots?: number
          min_bots?: number
          updated_at?: string
        }
        Update: {
          chat_frequency?: number
          created_at?: string
          id?: string
          is_active?: boolean
          join_frequency?: number
          leave_frequency?: number
          max_bots?: number
          min_bots?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          room: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          room: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          room?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      game_configs: {
        Row: {
          enabled: boolean
          house_edge: number
          id: string
          max_bet: number
          min_bet: number
          name: string
          payouts: Json
          rtp: number
        }
        Insert: {
          enabled?: boolean
          house_edge?: number
          id: string
          max_bet?: number
          min_bet?: number
          name: string
          payouts?: Json
          rtp?: number
        }
        Update: {
          enabled?: boolean
          house_edge?: number
          id?: string
          max_bet?: number
          min_bet?: number
          name?: string
          payouts?: Json
          rtp?: number
        }
        Relationships: []
      }
      game_results: {
        Row: {
          bet_amount: number
          created_at: string
          game: string
          game_data: Json | null
          id: string
          is_win: boolean
          user_id: string
          win_amount: number
        }
        Insert: {
          bet_amount: number
          created_at?: string
          game: string
          game_data?: Json | null
          id?: string
          is_win: boolean
          user_id: string
          win_amount: number
        }
        Update: {
          bet_amount?: number
          created_at?: string
          game?: string
          game_data?: Json | null
          id?: string
          is_win?: boolean
          user_id?: string
          win_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          created_at: string
          id: string
          preferences: Json | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          id: string
          preferences?: Json | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          id?: string
          preferences?: Json | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      slot_configs: {
        Row: {
          bonus_frequency: number
          enabled: boolean
          house_edge: number
          id: string
          jackpot_contribution: number
          jackpot_seed: number
          max_bet: number
          min_bet: number
          name: string
          payouts: Json
          reels: number
          rtp: number
          slot_type: string
          special_features: Json
          symbol_weights: Json
          symbols_per_reel: number
        }
        Insert: {
          bonus_frequency?: number
          enabled?: boolean
          house_edge?: number
          id: string
          jackpot_contribution?: number
          jackpot_seed?: number
          max_bet?: number
          min_bet?: number
          name: string
          payouts?: Json
          reels?: number
          rtp?: number
          slot_type?: string
          special_features?: Json
          symbol_weights?: Json
          symbols_per_reel?: number
        }
        Update: {
          bonus_frequency?: number
          enabled?: boolean
          house_edge?: number
          id?: string
          jackpot_contribution?: number
          jackpot_seed?: number
          max_bet?: number
          min_bet?: number
          name?: string
          payouts?: Json
          reels?: number
          rtp?: number
          slot_type?: string
          special_features?: Json
          symbol_weights?: Json
          symbols_per_reel?: number
        }
        Relationships: []
      }
      time_rewards: {
        Row: {
          claim_count: number
          created_at: string
          currency_type: string
          id: string
          last_claimed: string
          user_id: string
        }
        Insert: {
          claim_count?: number
          created_at?: string
          currency_type?: string
          id?: string
          last_claimed?: string
          user_id: string
        }
        Update: {
          claim_count?: number
          created_at?: string
          currency_type?: string
          id?: string
          last_claimed?: string
          user_id?: string
        }
        Relationships: []
      }
      tournament_entries: {
        Row: {
          id: string
          joined_at: string
          score: number
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          score?: number
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          score?: number
          tournament_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          entry_fee: number
          game_type: string
          id: string
          is_active: boolean
          max_participants: number
          prize_pool: number
          start_time: string
          status: string
          title: string
          tournament_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          entry_fee?: number
          game_type: string
          id?: string
          is_active?: boolean
          max_participants?: number
          prize_pool?: number
          start_time?: string
          status?: string
          title: string
          tournament_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          entry_fee?: number
          game_type?: string
          id?: string
          is_active?: boolean
          max_participants?: number
          prize_pool?: number
          start_time?: string
          status?: string
          title?: string
          tournament_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          game: string | null
          id: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          game?: string | null
          id?: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          game?: string | null
          id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          balance: number | null
          biggest_win: number | null
          created_at: string | null
          games_played: number | null
          games_won: number | null
          total_winnings: number | null
          username: string | null
          win_rate: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_leaderboard: {
        Args:
          | Record<PropertyKey, never>
          | { time_period?: string; limit_count?: number }
        Returns: {
          id: string
          username: string
          avatar_url: string
          games_played: number
          games_won: number
          total_winnings: number
          biggest_win: number
          win_rate: number
        }[]
      }
      get_tournament_details: {
        Args: { tournament_id: string }
        Returns: {
          id: string
          title: string
          description: string
          start_time: string
          end_time: string
          prize_pool: number
          game_type: string
          tournament_type: string
          status: string
          is_active: boolean
          participant_count: number
        }[]
      }
      get_tournament_details_data: {
        Args: { tournament_id: string }
        Returns: {
          id: string
          title: string
          description: string
          prize_pool: number
          entry_fee: number
          max_participants: number
          current_participants: number
          start_date: string
          end_date: string
          game_type: string
          status: string
          created_at: string
          updated_at: string
        }[]
      }
      get_tournament_leaderboard: {
        Args: { tournament_id: string }
        Returns: {
          id: string
          user_id: string
          username: string
          avatar_url: string
          score: number
          rank: number
        }[]
      }
      get_tournament_leaderboard_data: {
        Args: { tournament_id: string }
        Returns: {
          id: string
          user_id: string
          score: number
          rank: number
          username: string
          avatar_url: string
        }[]
      }
      get_user_rank: {
        Args: { target_user_id: string; time_period?: string }
        Returns: {
          rank: number
          games_played: number
          total_winnings: number
        }[]
      }
      get_user_tournament_standing: {
        Args: { tournament_id: string; user_id: string }
        Returns: {
          rank: number
          score: number
        }[]
      }
      update_balance: {
        Args:
          | Record<PropertyKey, never>
          | {
              user_uuid: string
              amount: number
              t_type: string
              game_name?: string
              meta?: Json
            }
        Returns: undefined
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
