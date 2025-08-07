CREATE TABLE risks (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  compliance_framework VARCHAR(50) NOT NULL,
  likelihood INTEGER NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
  impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  status VARCHAR(50) NOT NULL DEFAULT 'identified',
  owner_id VARCHAR(100) NOT NULL,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  mitigation_plan TEXT,
  residual_likelihood INTEGER CHECK (residual_likelihood >= 1 AND residual_likelihood <= 5),
  residual_impact INTEGER CHECK (residual_impact >= 1 AND residual_impact <= 5),
  residual_risk_score INTEGER GENERATED ALWAYS AS (COALESCE(residual_likelihood, likelihood) * COALESCE(residual_impact, impact)) STORED
);

CREATE TABLE risk_controls (
  id BIGSERIAL PRIMARY KEY,
  risk_id BIGINT NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  control_name VARCHAR(255) NOT NULL,
  control_description TEXT,
  control_type VARCHAR(50) NOT NULL,
  effectiveness VARCHAR(50) NOT NULL,
  implementation_status VARCHAR(50) NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE risk_assessments (
  id BIGSERIAL PRIMARY KEY,
  risk_id BIGINT NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assessor_id VARCHAR(100) NOT NULL,
  likelihood INTEGER NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
  impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_risks_category ON risks(category);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_compliance_framework ON risks(compliance_framework);
CREATE INDEX idx_risks_owner_id ON risks(owner_id);
CREATE INDEX idx_risks_created_by ON risks(created_by);
CREATE INDEX idx_risk_controls_risk_id ON risk_controls(risk_id);
CREATE INDEX idx_risk_assessments_risk_id ON risk_assessments(risk_id);
