-- Almajd (PHP) Schema - PostgreSQL
-- Compatible with PostgreSQL 12+

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_profiles (
  id BIGSERIAL PRIMARY KEY,
  public_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  job_title TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  avatar_url TEXT,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public_profiles
  ADD CONSTRAINT public_profiles_public_id_range
  CHECK (public_id IS NULL OR (public_id >= 0 AND public_id <= 9999));
