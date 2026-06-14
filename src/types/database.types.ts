// =============================================================
// database.types.ts
// Tipos generados de Supabase (estructura de tablas)
// Actualizar ejecutando: pnpm dlx supabase gen types typescript
// =============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'platform_admin';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'user' | 'platform_admin';
          created_at?: string;
        };
        Update: {
          role?: 'user' | 'platform_admin';
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          owner_id: string;
          invite_code: string;
          invite_url: string | null;
          qr_code_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          owner_id: string;
          invite_code: string;
          invite_url?: string | null;
          qr_code_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          image_url?: string | null;
          invite_code?: string;
          invite_url?: string | null;
          qr_code_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member';
          joined_at?: string;
        };
        Update: {
          role?: 'owner' | 'admin' | 'member';
        };
      };
      teams: {
        Row: {
          id: string;
          external_api_id: number;
          name: string;
          short_name: string | null;
          tla: string | null;
          crest_url: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_api_id: number;
          name: string;
          short_name?: string | null;
          tla?: string | null;
          crest_url?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          short_name?: string | null;
          tla?: string | null;
          crest_url?: string | null;
          country?: string | null;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          external_api_id: number;
          competition_id: number | null;
          competition_code: string;
          competition_name: string | null;
          season_id: number | null;
          season_year: number | null;
          utc_date: string;
          kickoff_time: string;
          status:
            | 'scheduled'
            | 'timed'
            | 'in_play'
            | 'paused'
            | 'finished'
            | 'postponed'
            | 'suspended'
            | 'cancelled';
          matchday: number | null;
          stage: string | null;
          group_name: string | null;
          home_team_id: string | null;
          away_team_id: string | null;
          home_team_name: string | null;
          away_team_name: string | null;
          home_team_crest: string | null;
          away_team_crest: string | null;
          home_score: number | null;
          away_score: number | null;
          winner: string | null;
          duration: string | null;
          last_updated_from_api: string | null;
          raw_api_payload: Json | null;
          manually_updated: boolean;
          manually_updated_by: string | null;
          manually_updated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_api_id: number;
          competition_id?: number | null;
          competition_code?: string;
          competition_name?: string | null;
          season_id?: number | null;
          season_year?: number | null;
          utc_date: string;
          kickoff_time: string;
          status?: string;
          matchday?: number | null;
          stage?: string | null;
          group_name?: string | null;
          home_team_id?: string | null;
          away_team_id?: string | null;
          home_team_name?: string | null;
          away_team_name?: string | null;
          home_team_crest?: string | null;
          away_team_crest?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          winner?: string | null;
          duration?: string | null;
          last_updated_from_api?: string | null;
          raw_api_payload?: Json | null;
          manually_updated?: boolean;
          manually_updated_by?: string | null;
          manually_updated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: string;
          home_score?: number | null;
          away_score?: number | null;
          winner?: string | null;
          duration?: string | null;
          last_updated_from_api?: string | null;
          raw_api_payload?: Json | null;
          manually_updated?: boolean;
          manually_updated_by?: string | null;
          manually_updated_at?: string | null;
          home_team_name?: string | null;
          away_team_name?: string | null;
          home_team_crest?: string | null;
          away_team_crest?: string | null;
          stage?: string | null;
          group_name?: string | null;
          updated_at?: string;
        };
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          group_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          points_awarded: number;
          exact_score_hit: boolean;
          result_hit: boolean;
          goal_difference_hit: boolean;
          is_locked: boolean;
          locked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          group_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          points_awarded?: number;
          exact_score_hit?: boolean;
          result_hit?: boolean;
          goal_difference_hit?: boolean;
          is_locked?: boolean;
          locked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          predicted_home_score?: number;
          predicted_away_score?: number;
          points_awarded?: number;
          exact_score_hit?: boolean;
          result_hit?: boolean;
          goal_difference_hit?: boolean;
          is_locked?: boolean;
          locked_at?: string | null;
          updated_at?: string;
        };
      };
      standings: {
        Row: {
          id: string;
          competition_code: string;
          season_year: number | null;
          group_name: string | null;
          team_id: string | null;
          team_name: string;
          team_crest: string | null;
          position: number;
          played_games: number;
          won: number;
          draw: number;
          lost: number;
          goals_for: number;
          goals_against: number;
          goal_difference: number;
          points: number;
          last_updated_from_api: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competition_code?: string;
          season_year?: number | null;
          group_name?: string | null;
          team_id?: string | null;
          team_name: string;
          team_crest?: string | null;
          position: number;
          played_games?: number;
          won?: number;
          draw?: number;
          lost?: number;
          goals_for?: number;
          goals_against?: number;
          goal_difference?: number;
          points?: number;
          last_updated_from_api?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          position?: number;
          played_games?: number;
          won?: number;
          draw?: number;
          lost?: number;
          goals_for?: number;
          goals_against?: number;
          goal_difference?: number;
          points?: number;
          last_updated_from_api?: string | null;
          updated_at?: string;
        };
      };
      sync_logs: {
        Row: {
          id: string;
          sync_type: string;
          status: string;
          matches_synced: number;
          teams_synced: number;
          standings_synced: number;
          error_message: string | null;
          started_at: string;
          completed_at: string | null;
          triggered_by: string;
        };
        Insert: {
          id?: string;
          sync_type: string;
          status: string;
          matches_synced?: number;
          teams_synced?: number;
          standings_synced?: number;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
          triggered_by?: string;
        };
        Update: {
          status?: string;
          matches_synced?: number;
          teams_synced?: number;
          standings_synced?: number;
          error_message?: string | null;
          completed_at?: string | null;
        };
      };
      api_request_logs: {
        Row: {
          id: string;
          endpoint: string;
          method: string;
          status_code: number | null;
          response_time_ms: number | null;
          error_message: string | null;
          requested_at: string;
        };
        Insert: {
          id?: string;
          endpoint: string;
          method?: string;
          status_code?: number | null;
          response_time_ms?: number | null;
          error_message?: string | null;
          requested_at?: string;
        };
        Update: Record<string, never>;
      };
      manual_match_updates: {
        Row: {
          id: string;
          match_id: string;
          updated_by: string;
          previous_home_score: number | null;
          previous_away_score: number | null;
          previous_status: string | null;
          new_home_score: number | null;
          new_away_score: number | null;
          new_status: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          updated_by: string;
          previous_home_score?: number | null;
          previous_away_score?: number | null;
          previous_status?: string | null;
          new_home_score?: number | null;
          new_away_score?: number | null;
          new_status?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      global_role: 'user' | 'platform_admin';
      group_member_role: 'owner' | 'admin' | 'member';
      match_status:
        | 'scheduled'
        | 'timed'
        | 'in_play'
        | 'paused'
        | 'finished'
        | 'postponed'
        | 'suspended'
        | 'cancelled';
      match_stage:
        | 'GROUP_STAGE'
        | 'ROUND_OF_16'
        | 'QUARTER_FINALS'
        | 'SEMI_FINALS'
        | 'THIRD_PLACE'
        | 'FINAL';
      sync_type:
        | 'fixtures'
        | 'today_matches'
        | 'standings'
        | 'lock_predictions'
        | 'recalculate_points';
      sync_status: 'success' | 'error' | 'partial';
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

type FixGenericTable<T> = {
  Row: T extends { Row: infer R } ? R : Record<string, unknown>;
  Insert: T extends { Insert: infer I } ? I : Record<string, unknown>;
  Update: T extends { Update: infer U } ? U : Record<string, unknown>;
  Relationships: T extends { Relationships: infer Rel } ? Rel : never[];
};

type FixTables<T> = {
  [K in keyof T]: FixGenericTable<T[K]>;
};

type FixDatabase<DB> = {
  public: {
    Tables: FixTables<DB extends { public: { Tables: infer T } } ? T : {}>;
    Views: DB extends { public: { Views: infer V } } ? V : Record<string, never>;
    Functions: DB extends { public: { Functions: infer F } } ? F : Record<string, never>;
    Enums: DB extends { public: { Enums: infer E } } ? E : Record<string, never>;
  };
};

export type FixedDatabase = FixDatabase<Database>;
