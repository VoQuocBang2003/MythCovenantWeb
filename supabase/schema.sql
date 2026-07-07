-- Myth Covenant - Complete Database Schema
-- This file contains the complete schema for reference purposes
-- Run migrations in numerical order for actual deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: users
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- TABLE: players
-- ============================================================================
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

CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_display_name ON players(display_name);
CREATE INDEX idx_players_current_team_id ON players(current_team_id);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_is_available ON players(is_available);
CREATE INDEX idx_players_level ON players(level);
CREATE INDEX idx_players_total_points ON players(total_points);
CREATE INDEX idx_players_created_at ON players(created_at);

-- ============================================================================
-- TABLE: teams
-- ============================================================================
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

CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_team_code ON teams(team_code);
CREATE INDEX idx_teams_is_active ON teams(is_active);
CREATE INDEX idx_teams_current_member_count ON teams(current_member_count);
CREATE INDEX idx_teams_created_at ON teams(created_at);

-- ============================================================================
-- TABLE: team_members
-- ============================================================================
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

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_player_id ON team_members(player_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);
CREATE INDEX idx_team_members_is_current ON team_members(is_current);
CREATE INDEX idx_team_members_joined_at ON team_members(joined_at);

-- ============================================================================
-- TABLE: settings
-- ============================================================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    team_id UUID,
    key VARCHAR(100) NOT NULL,
    value JSONB,
    data_type VARCHAR(20) NOT NULL DEFAULT 'string',
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settings_user_id ON settings(user_id);
CREATE INDEX idx_settings_team_id ON settings(team_id);
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_is_system ON settings(is_system);
CREATE INDEX idx_settings_is_active ON settings(is_active);
CREATE INDEX idx_settings_data_type ON settings(data_type);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================
ALTER TABLE players 
    ADD CONSTRAINT fk_players_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE players 
    ADD CONSTRAINT fk_players_current_team 
    FOREIGN KEY (current_team_id) 
    REFERENCES teams(id) 
    ON DELETE SET NULL;

ALTER TABLE teams 
    ADD CONSTRAINT fk_teams_leader 
    FOREIGN KEY (leader_id) 
    REFERENCES players(id) 
    ON DELETE SET NULL;

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

ALTER TABLE settings 
    ADD CONSTRAINT fk_settings_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE settings 
    ADD CONSTRAINT fk_settings_team 
    FOREIGN KEY (team_id) 
    REFERENCES teams(id) 
    ON DELETE CASCADE;

-- ============================================================================
-- UNIQUE CONSTRAINTS
-- ============================================================================
ALTER TABLE team_members 
    ADD CONSTRAINT unique_team_player_current 
    UNIQUE (team_id, player_id, is_current);

ALTER TABLE settings 
    ADD CONSTRAINT unique_setting_key 
    UNIQUE (user_id, team_id, key);