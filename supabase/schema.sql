-- ============================================================
-- MUNDIAL PREDICTOR — Schema SQL completo para Supabase
-- Ejecutar en el SQL Editor de Supabase en el orden indicado
-- ============================================================

-- ============================================================
-- 0. EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TIPOS ENUM
-- ============================================================

CREATE TYPE global_role AS ENUM ('user', 'platform_admin');
CREATE TYPE group_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE match_status AS ENUM (
  'scheduled', 'timed', 'in_play', 'paused', 'finished',
  'postponed', 'suspended', 'cancelled'
);
CREATE TYPE match_stage AS ENUM (
  'GROUP_STAGE', 'ROUND_OF_16', 'QUARTER_FINALS',
  'SEMI_FINALS', 'THIRD_PLACE', 'FINAL'
);
CREATE TYPE sync_type AS ENUM (
  'fixtures', 'today_matches', 'standings',
  'lock_predictions', 'recalculate_points'
);
CREATE TYPE sync_status AS ENUM ('success', 'error', 'partial');

-- ============================================================
-- 2. TABLA: profiles
-- ============================================================

CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Perfil público de cada usuario registrado';

-- ============================================================
-- 3. TABLA: user_roles
-- ============================================================

CREATE TABLE user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role       global_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_roles IS 'Roles globales de la plataforma (user / platform_admin)';

-- ============================================================
-- 4. TABLA: teams
-- ============================================================

CREATE TABLE teams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_api_id INTEGER UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  short_name      TEXT,
  tla             TEXT,
  crest_url       TEXT,
  country         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE teams IS 'Equipos del Mundial sincronizados desde football-data.org';

-- ============================================================
-- 5. TABLA: matches
-- ============================================================

CREATE TABLE matches (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_api_id       INTEGER UNIQUE NOT NULL,
  competition_id        INTEGER,
  competition_code      TEXT DEFAULT 'WC',
  competition_name      TEXT,
  season_id             INTEGER,
  season_year           INTEGER,
  utc_date              TIMESTAMPTZ NOT NULL,
  kickoff_time          TIMESTAMPTZ NOT NULL,
  status                match_status DEFAULT 'scheduled',
  matchday              INTEGER,
  stage                 TEXT,
  group_name            TEXT,
  home_team_id          UUID REFERENCES teams(id),
  away_team_id          UUID REFERENCES teams(id),
  home_team_name        TEXT,
  away_team_name        TEXT,
  home_team_crest       TEXT,
  away_team_crest       TEXT,
  home_score            INTEGER,
  away_score            INTEGER,
  winner                TEXT,
  duration              TEXT,
  last_updated_from_api TIMESTAMPTZ,
  raw_api_payload       JSONB,
  manually_updated      BOOLEAN DEFAULT FALSE,
  manually_updated_by   UUID REFERENCES auth.users(id),
  manually_updated_at   TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE matches IS 'Partidos del Mundial sincronizados desde football-data.org';
COMMENT ON COLUMN matches.raw_api_payload IS 'Payload original de la API para auditoría';
COMMENT ON COLUMN matches.kickoff_time IS 'Hora de inicio usada para bloquear pronósticos (UTC)';

-- ============================================================
-- 6. TABLA: groups (grupos privados de pronósticos)
-- ============================================================

CREATE TABLE groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  owner_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  invite_url  TEXT,
  qr_code_url TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE groups IS 'Grupos privados de pronósticos creados por usuarios';
COMMENT ON COLUMN groups.invite_code IS 'Código único de 8 caracteres para invitaciones';

-- ============================================================
-- 7. TABLA: group_members
-- ============================================================

CREATE TABLE group_members (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role     group_member_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

COMMENT ON TABLE group_members IS 'Membresías de usuarios en grupos de pronósticos';

-- ============================================================
-- 8. TABLA: predictions
-- ============================================================

CREATE TABLE predictions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id             UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  group_id             UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  predicted_home_score INTEGER NOT NULL CHECK (predicted_home_score >= 0 AND predicted_home_score <= 20),
  predicted_away_score INTEGER NOT NULL CHECK (predicted_away_score >= 0 AND predicted_away_score <= 20),
  points_awarded       INTEGER DEFAULT 0,
  exact_score_hit      BOOLEAN DEFAULT FALSE,
  result_hit           BOOLEAN DEFAULT FALSE,
  goal_difference_hit  BOOLEAN DEFAULT FALSE,
  is_locked            BOOLEAN DEFAULT FALSE,
  locked_at            TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id, group_id)
);

COMMENT ON TABLE predictions IS 'Pronósticos de marcadores de usuarios por partido y grupo';

-- ============================================================
-- 9. TABLA: standings (grupos del Mundial)
-- ============================================================

CREATE TABLE standings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_code      TEXT DEFAULT 'WC',
  season_year           INTEGER,
  group_name            TEXT,
  team_id               UUID REFERENCES teams(id),
  team_name             TEXT NOT NULL,
  team_crest            TEXT,
  position              INTEGER NOT NULL,
  played_games          INTEGER DEFAULT 0,
  won                   INTEGER DEFAULT 0,
  draw                  INTEGER DEFAULT 0,
  lost                  INTEGER DEFAULT 0,
  goals_for             INTEGER DEFAULT 0,
  goals_against         INTEGER DEFAULT 0,
  goal_difference       INTEGER DEFAULT 0,
  points                INTEGER DEFAULT 0,
  last_updated_from_api TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_code, season_year, group_name, team_name)
);

COMMENT ON TABLE standings IS 'Tabla de posiciones de grupos del Mundial desde football-data.org';

-- ============================================================
-- 10. TABLA: sync_logs
-- ============================================================

CREATE TABLE sync_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type        sync_type NOT NULL,
  status           sync_status NOT NULL,
  matches_synced   INTEGER DEFAULT 0,
  teams_synced     INTEGER DEFAULT 0,
  standings_synced INTEGER DEFAULT 0,
  error_message    TEXT,
  started_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  triggered_by     TEXT DEFAULT 'cron'
);

COMMENT ON TABLE sync_logs IS 'Registro de sincronizaciones con football-data.org';

-- ============================================================
-- 11. TABLA: api_request_logs
-- ============================================================

CREATE TABLE api_request_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint        TEXT NOT NULL,
  method          TEXT DEFAULT 'GET',
  status_code     INTEGER,
  response_time_ms INTEGER,
  error_message   TEXT,
  requested_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE api_request_logs IS 'Log de cada llamada HTTP a football-data.org';

-- ============================================================
-- 12. TABLA: manual_match_updates
-- ============================================================

CREATE TABLE manual_match_updates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id             UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  updated_by           UUID REFERENCES auth.users(id) NOT NULL,
  previous_home_score  INTEGER,
  previous_away_score  INTEGER,
  previous_status      match_status,
  new_home_score       INTEGER,
  new_away_score       INTEGER,
  new_status           match_status,
  reason               TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE manual_match_updates IS 'Auditoría de actualizaciones manuales de resultados por admins';

-- ============================================================
-- 13. ÍNDICES
-- ============================================================

CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_kickoff ON matches(kickoff_time);
CREATE INDEX idx_matches_stage ON matches(stage);
CREATE INDEX idx_matches_group_name ON matches(group_name);
CREATE INDEX idx_matches_external_api_id ON matches(external_api_id);
CREATE INDEX idx_matches_utc_date ON matches(utc_date);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_match_id ON predictions(match_id);
CREATE INDEX idx_predictions_group_id ON predictions(group_id);
CREATE INDEX idx_predictions_is_locked ON predictions(is_locked);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_groups_invite_code ON groups(invite_code);
CREATE INDEX idx_groups_owner_id ON groups(owner_id);
CREATE INDEX idx_standings_group_name ON standings(group_name);
CREATE INDEX idx_standings_competition_code ON standings(competition_code);
CREATE INDEX idx_sync_logs_sync_type ON sync_logs(sync_type);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at DESC);
CREATE INDEX idx_api_request_logs_requested_at ON api_request_logs(requested_at DESC);

-- ============================================================
-- 14. FUNCIONES Y TRIGGERS
-- ============================================================

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_predictions_updated_at
  BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_standings_updated_at
  BEFORE UPDATE ON standings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función: crear perfil y rol automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 15. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_match_updates ENABLE ROW LEVEL SECURITY;

-- ---------- profiles ----------
CREATE POLICY "Usuarios autenticados pueden ver perfiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuario puede editar su propio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario puede insertar su propio perfil"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ---------- user_roles ----------
CREATE POLICY "Usuario puede ver su propio rol"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins pueden ver todos los roles (requiere función helper)
CREATE OR REPLACE FUNCTION is_platform_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = uid AND role = 'platform_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Admins pueden ver todos los roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (is_platform_admin(auth.uid()));

-- ---------- groups ----------
CREATE POLICY "Miembros pueden ver su grupo"
  ON groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuario autenticado puede crear grupo"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner y admin pueden editar grupo"
  ON groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
        AND group_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Solo owner puede eliminar grupo"
  ON groups FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- ---------- group_members ----------
CREATE POLICY "Miembros del grupo pueden ver miembros"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
        AND gm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuario puede unirse a grupo (insert propio)"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner/admin puede expulsar miembros"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id -- El propio usuario puede salir
    OR EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
        AND gm2.user_id = auth.uid()
        AND gm2.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owner/admin puede cambiar roles"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
        AND gm2.user_id = auth.uid()
        AND gm2.role IN ('owner', 'admin')
    )
  );

-- ---------- teams ----------
CREATE POLICY "Todos los autenticados pueden ver equipos"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo service role puede insertar/actualizar equipos"
  ON teams FOR ALL
  TO service_role
  USING (true);

-- ---------- matches ----------
CREATE POLICY "Todos los autenticados pueden ver partidos"
  ON matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo service role puede insertar/actualizar partidos"
  ON matches FOR ALL
  TO service_role
  USING (true);

-- ---------- predictions ----------
-- SELECT: el usuario ve sus propios pronósticos SIEMPRE.
-- Para pronósticos del grupo: los ve si el partido ya empezó (is_locked = true)
CREATE POLICY "Usuario ve sus propias predicciones"
  ON predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Miembros del grupo ven predicciones ajenas SOLO de partidos bloqueados
CREATE POLICY "Miembros ven predicciones bloqueadas del grupo"
  ON predictions FOR SELECT
  TO authenticated
  USING (
    is_locked = true
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = predictions.group_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuario puede crear su propio pronóstico"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND is_locked = false
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = predictions.group_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuario puede actualizar su pronóstico no bloqueado"
  ON predictions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND is_locked = false
  )
  WITH CHECK (
    auth.uid() = user_id
    AND is_locked = false
  );

-- Service role puede actualizar puntos y bloquear
CREATE POLICY "Service role puede gestionar predicciones"
  ON predictions FOR ALL
  TO service_role
  USING (true);

-- ---------- standings ----------
CREATE POLICY "Todos los autenticados pueden ver standings"
  ON standings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo service role puede modificar standings"
  ON standings FOR ALL
  TO service_role
  USING (true);

-- ---------- sync_logs, api_request_logs, manual_match_updates ----------
CREATE POLICY "Solo admins pueden ver sync_logs"
  ON sync_logs FOR SELECT
  TO authenticated
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Solo service role inserta sync_logs"
  ON sync_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Solo admins pueden ver api_request_logs"
  ON api_request_logs FOR SELECT
  TO authenticated
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Solo service role inserta api_request_logs"
  ON api_request_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Solo admins pueden ver manual_match_updates"
  ON manual_match_updates FOR SELECT
  TO authenticated
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Solo service role inserta manual_match_updates"
  ON manual_match_updates FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================
-- 16. REALTIME (habilitar en tablas necesarias)
-- ============================================================
-- Ejecutar desde Supabase Dashboard > Database > Replication
-- O con los siguientes comandos:

ALTER PUBLICATION supabase_realtime ADD TABLE predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE standings;
