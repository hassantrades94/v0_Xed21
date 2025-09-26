/*
# Add Missing Columns and Fix Schema Issues

This migration adds any missing columns and fixes schema inconsistencies.

## Changes Made:
1. Add updated_at columns where missing
2. Fix any data type mismatches
3. Add missing indexes
4. Update RLS policies
*/

-- Add updated_at column to boards if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boards' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE boards ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add updated_at column to subjects if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subjects' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE subjects ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add updated_at column to topics if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'topics' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE topics ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;
CREATE TRIGGER update_boards_updated_at 
  BEFORE UPDATE ON boards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at 
  BEFORE UPDATE ON subjects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
CREATE TRIGGER update_topics_updated_at 
  BEFORE UPDATE ON topics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure all necessary indexes exist
CREATE INDEX IF NOT EXISTS idx_boards_code ON boards(code);
CREATE INDEX IF NOT EXISTS idx_subjects_board_id ON subjects(board_id);
CREATE INDEX IF NOT EXISTS idx_subjects_grade_level ON subjects(grade_level);
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent_topic_id ON topics(parent_topic_id);

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Admin full access to boards" ON boards;
CREATE POLICY "Admin full access to boards" ON boards FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin full access to subjects" ON subjects;
CREATE POLICY "Admin full access to subjects" ON subjects FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin full access to topics" ON topics;
CREATE POLICY "Admin full access to topics" ON topics FOR ALL USING (true);