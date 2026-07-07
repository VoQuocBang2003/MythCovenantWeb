-- Migration: Create team_members table
-- Description: Junction table for team membership with role and status tracking

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    player_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_current BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Foreign Key constraints
ALTER TABLE team_members 
    ADD CONSTRAINT fk_team_members_team 
    FOREIGN KEY (team_id) 
    REFERENCES teams(id) 
    ON DELETE CASCADE;

ALTER TABLE team_members 
    ADD CONSTRAINT fk_team_members_player 
    FOREIGN KEY (player_id) 
    REFERENCES players(id) 
    ON DELETE CASCADE;

-- Unique constraint to prevent duplicate membership
ALTER TABLE team_members 
    ADD CONSTRAINT unique_team_player_current 
    UNIQUE (team_id, player_id, is_current);


-- Indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_player_id ON team_members(player_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);
CREATE INDEX idx_team_members_is_current ON team_members(is_current);
CREATE INDEX idx_team_members_joined_at ON team_members(joined_at);

-- Trigger to update updated_at
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();