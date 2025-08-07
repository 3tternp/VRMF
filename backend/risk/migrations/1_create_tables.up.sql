CREATE TABLE risks (
  id TEXT PRIMARY KEY,
  sn INTEGER UNIQUE NOT NULL,
  asset_group TEXT NOT NULL CHECK (asset_group IN ('Information', 'Network', 'Hardware', 'Software', 'Physical/Site', 'People')),
  asset TEXT NOT NULL,
  threat TEXT NOT NULL,
  vulnerability TEXT NOT NULL,
  risk_type TEXT NOT NULL,
  risk_owner TEXT NOT NULL,
  risk_owner_approval TEXT NOT NULL CHECK (risk_owner_approval IN ('Approved', 'Not Approved')),
  existing_controls TEXT,
  likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  impact_rationale TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  treatment_option_chosen TEXT NOT NULL CHECK (treatment_option_chosen IN ('Accept', 'Avoid', 'Modify', 'Share')),
  proposed_treatment_action TEXT NOT NULL,
  annex_a_control_reference TEXT NOT NULL,
  treatment_cost TEXT NOT NULL,
  treatment_action_owner TEXT NOT NULL,
  treatment_action_timescale TEXT NOT NULL,
  treatment_action_status TEXT NOT NULL CHECK (treatment_action_status IN ('Not Started', 'In Progress', 'Completed', 'Rejected')),
  post_treatment_likelihood INTEGER CHECK (post_treatment_likelihood BETWEEN 1 AND 5),
  post_treatment_impact INTEGER CHECK (post_treatment_impact BETWEEN 1 AND 5),
  post_treatment_risk_score INTEGER,
  post_treatment_risk_level TEXT CHECK (post_treatment_risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  treatment_option_chosen2 TEXT CHECK (treatment_option_chosen2 IN ('Accept', 'Avoid', 'Modify', 'Share')),
  comments TEXT,
  compliance_frameworks TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE SEQUENCE risks_sn_seq START 1;
CREATE INDEX idx_risks_sn ON risks(sn);
CREATE INDEX idx_risks_asset_group ON risks(asset_group);
CREATE INDEX idx_risks_risk_level ON risks(risk_level);
CREATE INDEX idx_risks_treatment_status ON risks(treatment_action_status);
CREATE INDEX idx_risks_created_by ON risks(created_by);
