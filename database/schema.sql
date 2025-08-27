-- Eloqua Database Schema
-- This file contains the SQL schema for the Eloqua debate speech analysis application

-- Enable Row Level Security (RLS)
-- Note: Set your JWT secret in your Supabase dashboard

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create speeches table
CREATE TABLE IF NOT EXISTS speeches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
    round_number TEXT,
    round_type TEXT NOT NULL DEFAULT 'practice',
    debate_format TEXT NOT NULL,
    position TEXT NOT NULL,
    motion TEXT NOT NULL,
    audio_path TEXT,
    speech_date DATE NOT NULL DEFAULT CURRENT_DATE,
    place_in_round TEXT,
    analysis_result JSONB,
    llm_analysis JSONB,
    prosody_stats JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_speeches_tournament_id ON speeches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_speeches_created_at ON speeches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_speeches_debate_format ON speeches(debate_format);
CREATE INDEX IF NOT EXISTS idx_speeches_position ON speeches(position);
CREATE INDEX IF NOT EXISTS idx_speeches_speech_date ON speeches(speech_date);
CREATE INDEX IF NOT EXISTS idx_speeches_place_in_round ON speeches(place_in_round);

-- Create full-text search index for motion and position
CREATE INDEX IF NOT EXISTS idx_speeches_search ON speeches USING GIN (
    to_tsvector('english', motion || ' ' || position || ' ' || COALESCE(place_in_round, ''))
);

-- Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE speeches ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you may want to restrict this based on your needs)
CREATE POLICY "Allow public read access to tournaments" ON tournaments
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to tournaments" ON tournaments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to speeches" ON speeches
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to speeches" ON speeches
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to speeches" ON speeches
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to speeches" ON speeches
    FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_tournaments_updated_at 
    BEFORE UPDATE ON tournaments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speeches_updated_at 
    BEFORE UPDATE ON speeches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample tournaments for testing
INSERT INTO tournaments (name) VALUES 
    ('World Universities Debating Championship 2024'),
    ('European Universities Debating Championship 2024'),
    ('Practice Session'),
    ('Local Tournament 2024')
ON CONFLICT (name) DO NOTHING;

-- Create a view for easier querying of speeches with tournament names
CREATE OR REPLACE VIEW speeches_with_tournaments AS
SELECT 
    s.*,
    t.name as tournament_name
FROM speeches s
LEFT JOIN tournaments t ON s.tournament_id = t.id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon; 