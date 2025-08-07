ALTER TABLE risks 
ADD COLUMN review_date TIMESTAMP,
ADD COLUMN next_assessment_date TIMESTAMP;

CREATE INDEX idx_risks_review_date ON risks(review_date);
CREATE INDEX idx_risks_next_assessment_date ON risks(next_assessment_date);
