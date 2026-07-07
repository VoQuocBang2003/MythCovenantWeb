-- Migration: Create players table
-- Description: Player profile information for game participants

CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    game_id VARCHAR(100),
    level INTEGER NOT NULL DEFAULT 1,
    experience INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    current_team_id UUID,
    is_available BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Foreign Key constraints
ALTER TABLE players 
    ADD CONSTRAINT fk_players_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

-- Note: fk_players_current_team will be added in migration 006

-- Indexes
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_display_name ON players(display_name);
CREATE INDEX idx_players_current_team_id ON players(current_team_id);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_is_available ON players(is_available);
CREATE INDEX idx_players_level ON players(level);
CREATE INDEX idx_players_total_points ON players(total_points);
CREATE INDEX idx_players_created_at ON players(created_at);

-- Trigger to update updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();