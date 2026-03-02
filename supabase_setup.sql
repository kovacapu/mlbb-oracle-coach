-- Supabase Setup Guide for MLBB AI Coach
-- Copy and paste this directly into your Supabase SQL Editor

-- 1. Create the profiles table
CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    nickname TEXT,
    main_role TEXT,
    avatar_hero_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view profiles" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = user_id);

-- 2. Create the matches table
CREATE TABLE public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hero_id TEXT NOT NULL,
    kills INTEGER NOT NULL DEFAULT 0,
    deaths INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    result TEXT NOT NULL CHECK (result IN ('Victory', 'Defeat')),
    items TEXT[] DEFAULT '{}',
    playstyle_tag TEXT,
    coach_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Configure Row Level Security (RLS)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for users to only see and insert their own matches
CREATE POLICY "Users can insert their own matches" 
    ON public.matches FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own matches" 
    ON public.matches FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches" 
    ON public.matches FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches" 
    ON public.matches FOR UPDATE 
    USING (auth.uid() = user_id);

-- 4. Enable realtime for matches table (optional, for live updates)
-- alter publication supabase_realtime add table public.matches;

-- ============================================================
-- MIGRATION: Eksik kolonlar + validation + index'ler
-- Supabase SQL Editor'de çalıştırın (varsa IF NOT EXISTS ile geçer)
-- ============================================================

-- Hero Varsayılan Yapı — profiles tablosuna JSONB kolonu
-- Format: { "chou": { spellId, emblemId, tier1Id, tier2Id, coreId, items[] }, ... }
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hero_builds JSONB DEFAULT '{}';

-- 5. Eksik kolonlar (MatchEntryForm bunları insert ediyor ama schema'da yoktu)
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS emblem_id TEXT,
  ADD COLUMN IF NOT EXISTS emblem_tier1_id TEXT,
  ADD COLUMN IF NOT EXISTS emblem_tier2_id TEXT,
  ADD COLUMN IF NOT EXISTS emblem_core_id TEXT,
  ADD COLUMN IF NOT EXISTS battle_spell_id TEXT;

-- 6. KDA değerleri negatif olamaz
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'matches_kills_non_negative'
  ) THEN
    ALTER TABLE public.matches
      ADD CONSTRAINT matches_kills_non_negative CHECK (kills >= 0),
      ADD CONSTRAINT matches_deaths_non_negative CHECK (deaths >= 0),
      ADD CONSTRAINT matches_assists_non_negative CHECK (assists >= 0);
  END IF;
END $$;

-- 7. Performans index'leri
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON public.matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_hero_id ON public.matches(hero_id);

-- ============================================================
-- RPC: Leaderboard — server-side aggregation
-- ============================================================

CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE(
  user_id       UUID,
  nickname      TEXT,
  avatar_hero_id TEXT,
  total_matches BIGINT,
  wins          BIGINT,
  win_rate      NUMERIC,
  avg_kda       NUMERIC,
  oracle_score  NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    COALESCE(p.nickname, 'Unknown')    AS nickname,
    COALESCE(p.avatar_hero_id, 'miya') AS avatar_hero_id,
    COUNT(m.id)                        AS total_matches,
    COUNT(m.id) FILTER (WHERE m.result = 'Victory') AS wins,

    -- Win rate %
    CASE WHEN COUNT(m.id) > 0
      THEN ROUND(
        COUNT(m.id) FILTER (WHERE m.result = 'Victory')::NUMERIC
        / COUNT(m.id) * 100, 1)
      ELSE 0
    END AS win_rate,

    -- Ortalama KDA
    CASE WHEN COUNT(m.id) > 0
      THEN ROUND(
        (SUM(m.kills) + SUM(m.assists))::NUMERIC
        / GREATEST(SUM(m.deaths), 1), 2)
      ELSE 0
    END AS avg_kda,

    -- Oracle score (0-100)
    CASE WHEN COUNT(m.id) > 0
      THEN LEAST(100, ROUND(
        (
          ROUND((SUM(m.kills) + SUM(m.assists))::NUMERIC
            / GREATEST(SUM(m.deaths), 1), 2) / 5 * 40
        ) + (
          COUNT(m.id) FILTER (WHERE m.result = 'Victory')::NUMERIC
          / COUNT(m.id) * 60
        )
      ))
      ELSE 0
    END AS oracle_score

  FROM public.profiles p
  LEFT JOIN public.matches m ON p.user_id = m.user_id
  GROUP BY p.user_id, p.nickname, p.avatar_hero_id
  HAVING COUNT(m.id) > 0
  ORDER BY win_rate DESC;
END;
$$;
