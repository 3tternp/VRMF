-- Add ISO 27001 specific fields to risks table
ALTER TABLE risks ADD COLUMN asset_group VARCHAR(50);
ALTER TABLE risks ADD COLUMN asset VARCHAR(255);
ALTER TABLE risks ADD COLUMN threat TEXT;
ALTER TABLE risks ADD COLUMN vulnerability TEXT;
ALTER TABLE risks ADD COLUMN risk_type VARCHAR(100);
ALTER TABLE risks ADD COLUMN risk_owner_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE risks ADD COLUMN existing_controls TEXT;
ALTER TABLE risks ADD COLUMN impact_rationale TEXT;
ALTER TABLE risks ADD COLUMN treatment_option VARCHAR(50);
ALTER TABLE risks ADD COLUMN proposed_treatment_action TEXT;
ALTER TABLE risks ADD COLUMN annex_a_reference VARCHAR(255);
ALTER TABLE risks ADD COLUMN treatment_cost INTEGER;
ALTER TABLE risks ADD COLUMN treatment_action_owner VARCHAR(255);
ALTER TABLE risks ADD COLUMN treatment_timescale VARCHAR(100);
ALTER TABLE risks ADD COLUMN treatment_status VARCHAR(50) DEFAULT 'not_started';
ALTER TABLE risks ADD COLUMN post_treatment_likelihood INTEGER CHECK (post_treatment_likelihood >= 1 AND post_treatment_likelihood <= 5);
ALTER TABLE risks ADD COLUMN post_treatment_impact INTEGER CHECK (post_treatment_impact >= 1 AND post_treatment_impact <= 5);
ALTER TABLE risks ADD COLUMN post_treatment_risk_score INTEGER GENERATED ALWAYS AS (COALESCE(post_treatment_likelihood, 0) * COALESCE(post_treatment_impact, 0)) STORED;
ALTER TABLE risks ADD COLUMN post_treatment_treatment_option VARCHAR(50);
ALTER TABLE risks ADD COLUMN comments TEXT;

-- Add indexes for new fields
CREATE INDEX idx_risks_asset_group ON risks(asset_group);
CREATE INDEX idx_risks_risk_type ON risks(risk_type);
CREATE INDEX idx_risks_treatment_option ON risks(treatment_option);
CREATE INDEX idx_risks_treatment_status ON risks(treatment_status);
