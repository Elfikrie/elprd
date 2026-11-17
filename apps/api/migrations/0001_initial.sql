-- Migrasi awal dijalankan di dalam transaksi oleh migrate.ts.
CREATE TABLE users (id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE plans (id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, document JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX plans_owner_created_idx ON plans(user_id, created_at DESC);
CREATE TABLE generation_quotas (user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, day DATE NOT NULL, count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0), PRIMARY KEY(user_id, day));

