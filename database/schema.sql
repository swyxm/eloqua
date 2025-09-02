-- Eloqua Database Schema
-- This file contains the SQL schema for the Eloqua debate speech analysis application

-- Enable Row Level Security (RLS)
-- Note: Set your JWT secret in your Supabase dashboard

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    start_date DATE,
    end_date DATE,
    format TEXT,
    location TEXT,
    description TEXT,
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
    partner TEXT,
    audio_path TEXT,
    speech_date DATE NOT NULL DEFAULT CURRENT_DATE,
    place_in_round TEXT,
    analysis_result JSONB,
    llm_analysis JSONB,
    prosody_stats JSONB,
    chat_context JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    school TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debate_rounds table
CREATE TABLE IF NOT EXISTS debate_rounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    round TEXT NOT NULL,
    motion TEXT,
    date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debate_results table
CREATE TABLE IF NOT EXISTS debate_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    round_id UUID REFERENCES debate_rounds(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    team_number INTEGER,
    speaker1_name TEXT,
    speaker2_name TEXT,
    position TEXT,
    result TEXT,
    team_score NUMERIC,
    speaker1_score NUMERIC,
    speaker2_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_speeches_tournament_id ON speeches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_speeches_created_at ON speeches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_speeches_debate_format ON speeches(debate_format);
CREATE INDEX IF NOT EXISTS idx_speeches_position ON speeches(position);
CREATE INDEX IF NOT EXISTS idx_speeches_partner ON speeches(partner);
CREATE INDEX IF NOT EXISTS idx_speeches_speech_date ON speeches(speech_date);
CREATE INDEX IF NOT EXISTS idx_speeches_place_in_round ON speeches(place_in_round);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name);
CREATE INDEX IF NOT EXISTS idx_partners_school ON partners(school);
CREATE INDEX IF NOT EXISTS idx_debate_rounds_tournament_id ON debate_rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_debate_rounds_date ON debate_rounds(date);
CREATE INDEX IF NOT EXISTS idx_debate_results_round_id ON debate_results(round_id);
CREATE INDEX IF NOT EXISTS idx_debate_results_tournament_id ON debate_results(tournament_id);

-- Create full-text search index for motion, position, and partner
CREATE INDEX IF NOT EXISTS idx_speeches_search ON speeches USING GIN (
    to_tsvector('english', motion || ' ' || position || ' ' || COALESCE(partner, '') || ' ' || COALESCE(place_in_round, ''))
);

-- Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE speeches ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_results ENABLE ROW LEVEL SECURITY;

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

-- Policies for partners table
CREATE POLICY "Allow public read access to partners" ON partners
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to partners" ON partners
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to partners" ON partners
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to partners" ON partners
    FOR DELETE USING (true);

-- Policies for debate_rounds table
CREATE POLICY "Allow public read access to debate_rounds" ON debate_rounds
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to debate_rounds" ON debate_rounds
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to debate_rounds" ON debate_rounds
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to debate_rounds" ON debate_rounds
    FOR DELETE USING (true);

-- Policies for debate_results table
CREATE POLICY "Allow public read access to debate_results" ON debate_results
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to debate_results" ON debate_results
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to debate_results" ON debate_results
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to debate_results" ON debate_results
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

CREATE TRIGGER update_partners_updated_at 
    BEFORE UPDATE ON partners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debate_rounds_updated_at 
    BEFORE UPDATE ON debate_rounds 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debate_results_updated_at 
    BEFORE UPDATE ON debate_results 
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