CREATE ROLE rancang_api NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT USAGE ON SCHEMA rancang TO rancang_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON rancang.users, rancang.sessions, rancang.plans, rancang.generation_quotas TO rancang_api;
GRANT SELECT ON rancang.schema_migrations TO rancang_api;
CREATE POLICY server_access ON rancang.users FOR ALL TO rancang_api USING (true) WITH CHECK (true);
CREATE POLICY server_access ON rancang.sessions FOR ALL TO rancang_api USING (true) WITH CHECK (true);
CREATE POLICY server_access ON rancang.plans FOR ALL TO rancang_api USING (true) WITH CHECK (true);
CREATE POLICY server_access ON rancang.generation_quotas FOR ALL TO rancang_api USING (true) WITH CHECK (true);
CREATE POLICY server_health ON rancang.schema_migrations FOR SELECT TO rancang_api USING (true);
