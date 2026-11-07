-- Obsidian Atelier — Design Agency Studio Hub
-- PostgreSQL schema for portfolio, engagements, checkout, and client workspace.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  company     TEXT,
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE portfolio_cases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  client_name TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('Branding','Web','Motion','Product','Packaging')),
  year        SMALLINT NOT NULL,
  cover_url   TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE pricing_tiers (
  id          TEXT PRIMARY KEY,               -- 'studio' | 'atelier' | 'obsidian'
  label       TEXT NOT NULL,
  base_price  NUMERIC(10,2) NOT NULL,
  unit_price  NUMERIC(10,2) NOT NULL
);

CREATE TABLE vouchers (
  code        TEXT PRIMARY KEY,
  discount    NUMERIC(4,3) NOT NULL CHECK (discount > 0 AND discount < 1),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at  TIMESTAMPTZ
);

CREATE TABLE engagements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tier_id       TEXT NOT NULL REFERENCES pricing_tiers(id),
  voucher_code  TEXT REFERENCES vouchers(code),
  brief         TEXT,
  budget_cap    NUMERIC(10,2),
  total_due     NUMERIC(10,2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE milestones (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id  UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  phase          TEXT NOT NULL DEFAULT 'New',
  done           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vault_assets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id  UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('env','endpoint','schema','command')),
  code           TEXT NOT NULL
);

CREATE TABLE booked_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id  UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  starts_at      TIMESTAMPTZ NOT NULL,
  label          TEXT NOT NULL,
  topic          TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (engagement_id, starts_at)
);

CREATE INDEX idx_milestones_engagement ON milestones(engagement_id);
CREATE INDEX idx_sessions_engagement   ON booked_sessions(engagement_id);

INSERT INTO pricing_tiers (id, label, base_price, unit_price) VALUES
  ('studio', 'Studio', 4800, 120),
  ('atelier', 'Atelier', 12400, 260),
  ('obsidian', 'Obsidian', 26000, 420);

INSERT INTO vouchers (code, discount) VALUES
  ('STUDIO20', 0.20), ('ATELIER15', 0.15), ('LAUNCH10', 0.10);
