-- Migration: Add remaining foreign key constraints
-- Description: Resolve circular dependencies between players and teams

-- Add FK from players to teams (current_team_id)
-- This is done after both tables are created
ALTER TABLE players 
    ADD CONSTRAINT fk_players_current_team 
    FOREIGN KEY (current_team_id) 
    REFERENCES teams(id) 
    ON DELETE SET NULL;

-- Add FK from teams to players (leader_id)
ALTER TABLE teams 
    ADD CONSTRAINT fk_teams_leader 
    FOREIGN KEY (leader_id) 
    REFERENCES players(id) 
    ON DELETE SET NULL;