SELECT pg_advisory_xact_lock(8172601);
-- Schema khusus menjaga tabel Rancang terpisah dari public dan auth milik Supabase.
CREATE SCHEMA IF NOT EXISTS rancang;
REVOKE ALL ON SCHEMA rancang FROM PUBLIC;
CREATE TABLE rancang.users (
  id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE rancang.sessions (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES rancang.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX sessions_expiry_idx ON rancang.sessions(expires_at);
CREATE TABLE rancang.plans (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES rancang.users(id) ON DELETE CASCADE,
  document JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX plans_owner_created_idx ON rancang.plans(user_id, created_at DESC);
CREATE TABLE rancang.generation_quotas (
  user_id UUID NOT NULL REFERENCES rancang.users(id) ON DELETE CASCADE,
  day DATE NOT NULL, count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY(user_id, day)
);
ALTER TABLE rancang.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rancang.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rancang.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rancang.generation_quotas ENABLE ROW LEVEL SECURITY;
-- Tidak ada policy untuk anon/authenticated: akses hanya melalui backend pemilik tabel.

CREATE TABLE rancang.schema_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE rancang.schema_migrations ENABLE ROW LEVEL SECURITY;
INSERT INTO rancang.schema_migrations(name, checksum) VALUES ('0001_initial', '62e9fe418bbeb51def0312e2fd23cbc4071a02f02242e748bee09274e2400ea4');
