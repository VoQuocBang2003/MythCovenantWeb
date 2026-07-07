-- Migration: Create settings table
-- Description: Application-wide and user-specific settings configuration

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

-- Foreign Key constraints
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

-- Unique constraint for key combinations
ALTER TABLE settings 
    ADD CONSTRAINT unique_setting_key 
    UNIQUE (user_id, team_id, key);

-- Indexes
CREATE INDEX idx_settings_user_id ON settings(user_id);
CREATE INDEX idx_settings_team_id ON settings(team_id);
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_is_system ON settings(is_system);
CREATE INDEX idx_settings_is_active ON settings(is_active);
CREATE INDEX idx_settings_data_type ON settings(data_type);

-- Trigger to update updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();