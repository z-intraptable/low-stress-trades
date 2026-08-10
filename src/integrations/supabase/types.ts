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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bot_rankings: {
        Row: {
          avg_yield: number
          bot_name: string
          created_at: string
          id: string
          strategy_summary: string
          timeframe: string
          updated_at: string
          user_id: string
          volume_tier: string
          win_rate: number
        }
        Insert: {
          avg_yield: number
          bot_name: string
          created_at?: string
          id?: string
          strategy_summary: string
          timeframe: string
          updated_at?: string
          user_id: string
          volume_tier: string
          win_rate: number
        }
        Update: {
          avg_yield?: number
          bot_name?: string
          created_at?: string
          id?: string
          strategy_summary?: string
          timeframe?: string
          updated_at?: string
          user_id?: string
          volume_tier?: string
          win_rate?: number
        }
        Relationships: []
      }
      data_source_status: {
        Row: {
          error_message: string | null
          id: string
          last_updated: string
          latency_ms: number | null
          layer: string
          source_name: string
          status: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          last_updated?: string
          latency_ms?: number | null
          layer: string
          source_name: string
          status: string
        }
        Update: {
          error_message?: string | null
          id?: string
          last_updated?: string
          latency_ms?: number | null
          layer?: string
          source_name?: string
          status?: string
        }
        Relationships: []
      }
      exchange_connections: {
        Row: {
          api_key: string
          api_secret: string
          created_at: string
          exchange: string
          id: string
          last_verified_at: string | null
          live_trading_enabled: boolean
          testnet: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          api_secret: string
          created_at?: string
          exchange: string
          id?: string
          last_verified_at?: string | null
          live_trading_enabled?: boolean
          testnet?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          api_secret?: string
          created_at?: string
          exchange?: string
          id?: string
          last_verified_at?: string | null
          live_trading_enabled?: boolean
          testnet?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      liquidation_clusters: {
        Row: {
          id: string
          pair: string
          price_level: number
          size_bucket: string
          timestamp: string
          volume: number
        }
        Insert: {
          id?: string
          pair: string
          price_level: number
          size_bucket: string
          timestamp?: string
          volume: number
        }
        Update: {
          id?: string
          pair?: string
          price_level?: number
          size_bucket?: string
          timestamp?: string
          volume?: number
        }
        Relationships: []
      }
      qce_signals: {
        Row: {
          adx14: number
          atr14: number
          confluence_score: number
          correlation_flag: boolean
          cost_adjusted_rr: number | null
          created_at: string
          entry: number
          id: string
          liquidity_state: string
          orderbook_agreement: string
          price: number
          processed: boolean
          raw_score: number
          regime_state: string
          signal: string
          sl: number
          suggested_position_size: number | null
          symbol: string
          timeframe: string
          tp1: number
          tp2: number
          tp3: number
          type: string
          user_id: string
          volume_ratio: number
        }
        Insert: {
          adx14: number
          atr14: number
          confluence_score: number
          correlation_flag?: boolean
          cost_adjusted_rr?: number | null
          created_at?: string
          entry: number
          id?: string
          liquidity_state: string
          orderbook_agreement: string
          price: number
          processed?: boolean
          raw_score: number
          regime_state: string
          signal: string
          sl: number
          suggested_position_size?: number | null
          symbol: string
          timeframe: string
          tp1: number
          tp2: number
          tp3: number
          type: string
          user_id: string
          volume_ratio: number
        }
        Update: {
          adx14?: number
          atr14?: number
          confluence_score?: number
          correlation_flag?: boolean
          cost_adjusted_rr?: number | null
          created_at?: string
          entry?: number
          id?: string
          liquidity_state?: string
          orderbook_agreement?: string
          price?: number
          processed?: boolean
          raw_score?: number
          regime_state?: string
          signal?: string
          sl?: number
          suggested_position_size?: number | null
          symbol?: string
          timeframe?: string
          tp1?: number
          tp2?: number
          tp3?: number
          type?: string
          user_id?: string
          volume_ratio?: number
        }
        Relationships: []
      }
      signal_backtests: {
        Row: {
          bars_to_resolution: number
          created_at: string
          id: string
          outcome: string
          r_multiple: number
          signal_id: string
          summary: string
          user_id: string
        }
        Insert: {
          bars_to_resolution: number
          created_at?: string
          id?: string
          outcome: string
          r_multiple: number
          signal_id: string
          summary: string
          user_id: string
        }
        Update: {
          bars_to_resolution?: number
          created_at?: string
          id?: string
          outcome?: string
          r_multiple?: number
          signal_id?: string
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signal_backtests_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "qce_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          closed_at: string | null
          entry_price: number
          exit_price: number | null
          id: string
          opened_at: string
          pair: string
          pnl: number | null
          side: string
          signal_id: string | null
          size: number
          slippage: number | null
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          entry_price: number
          exit_price?: number | null
          id?: string
          opened_at?: string
          pair: string
          pnl?: number | null
          side: string
          signal_id?: string | null
          size: number
          slippage?: number | null
          user_id: string
        }
        Update: {
          closed_at?: string | null
          entry_price?: number
          exit_price?: number | null
          id?: string
          opened_at?: string
          pair?: string
          pnl?: number | null
          side?: string
          signal_id?: string | null
          size?: number
          slippage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "qce_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          account_balance: number | null
          created_at: string
          daily_loss_limit_pct: number | null
          id: string
          max_trades_per_day: number | null
          pin_hash: string | null
          pin_salt: string | null
          risk_pct_per_trade: number | null
          slippage_estimate_pct: number | null
          taker_fee_pct: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_balance?: number | null
          created_at?: string
          daily_loss_limit_pct?: number | null
          id?: string
          max_trades_per_day?: number | null
          pin_hash?: string | null
          pin_salt?: string | null
          risk_pct_per_trade?: number | null
          slippage_estimate_pct?: number | null
          taker_fee_pct?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_balance?: number | null
          created_at?: string
          daily_loss_limit_pct?: number | null
          id?: string
          max_trades_per_day?: number | null
          pin_hash?: string | null
          pin_salt?: string | null
          risk_pct_per_trade?: number | null
          slippage_estimate_pct?: number | null
          taker_fee_pct?: number | null
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
      consecutive_losing_trades: {
        Args: { _limit?: number; _user_id: string }
        Returns: number
      }
      daily_realized_pnl: { Args: { _user_id: string }; Returns: number }
      trades_today: { Args: { _user_id: string }; Returns: number }
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
