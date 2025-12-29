-- Add columns to best_current
ALTER TABLE best_current ADD COLUMN title TEXT;
ALTER TABLE best_current ADD COLUMN difficulty TEXT;

-- Add columns to best_history
ALTER TABLE best_history ADD COLUMN title TEXT;
ALTER TABLE best_history ADD COLUMN difficulty TEXT;
