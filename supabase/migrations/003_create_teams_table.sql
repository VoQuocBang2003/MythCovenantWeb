-- Migration: Create teams table
-- Description: Team management for game participants

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID,
    max_members INTEGER NOT NULL DEFAULT 5,
    current_member_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    team_code VARCHAR(20) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Foreign Key constraints
-- Note: fk_teams_leader will be added in migration 006

-- Indexes
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_team_code ON teams(team_code);
CREATE INDEX idx_teams_is_active ON teams(is_active);
CREATE INDEX idx_teams_current_member_count ON teams(current_member_count);
CREATE INDEX idx_teams_created_at ON teams(created_at);

-- Trigger to update updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();