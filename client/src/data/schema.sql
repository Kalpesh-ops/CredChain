-- ================================================================
-- CredChain Production Supabase Database Initialization & Security Script
-- Execute this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ================================================================

-- 1. Create Feedbacks Table for Live Community Forum
CREATE TABLE IF NOT EXISTS feedbacks (
  id VARCHAR(100) PRIMARY KEY,
  address VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  comment TEXT NOT NULL,
  timestamp VARCHAR(50) NOT NULL,
  wallet_type VARCHAR(50) NOT NULL DEFAULT 'Direct Input',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Performance & Query Optimization Indices
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON feedbacks(rating);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 4. Security Policy: Allow Public Read Access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feedbacks' AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access" ON feedbacks FOR SELECT USING (true);
  END IF;
END $$;

-- 5. Security Policy: Allow Public Insert with Payload Validation Checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feedbacks' AND policyname = 'Allow public insert'
  ) THEN
    CREATE POLICY "Allow public insert" ON feedbacks FOR INSERT WITH CHECK (rating >= 1 AND rating <= 5 AND length(comment) > 0);
  END IF;
END $$;
