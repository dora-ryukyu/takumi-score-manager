-- scripts/migrate-chart-ids.sql

-- 1. LAST PROPOZE [INSANITY] (14.6)
-- Delete OLD if NEW is better or equal
DELETE FROM best_current 
WHERE chart_id = 'LAST_PROPOZE_INSANITY_14.6' 
  AND user_id IN (
    SELECT o.user_id 
    FROM best_current o
    JOIN best_current n ON o.user_id = n.user_id
    WHERE o.chart_id = 'LAST_PROPOZE_INSANITY_14.6' 
      AND n.chart_id = 'LAST PROPOZE_INSANITY_14.6'
      AND n.best_score >= o.best_score
  );

-- Delete NEW if OLD is better
DELETE FROM best_current 
WHERE chart_id = 'LAST PROPOZE_INSANITY_14.6' 
  AND user_id IN (
    SELECT n.user_id 
    FROM best_current o
    JOIN best_current n ON o.user_id = n.user_id
    WHERE o.chart_id = 'LAST_PROPOZE_INSANITY_14.6' 
      AND n.chart_id = 'LAST PROPOZE_INSANITY_14.6'
      AND o.best_score > n.best_score
  );

-- Rename remaining OLD to NEW
UPDATE best_current 
SET chart_id = 'LAST PROPOZE_INSANITY_14.6' 
WHERE chart_id = 'LAST_PROPOZE_INSANITY_14.6';

-- Update history
UPDATE best_history 
SET chart_id = 'LAST PROPOZE_INSANITY_14.6' 
WHERE chart_id = 'LAST_PROPOZE_INSANITY_14.6';


-- 2. Ardent Gaff [MASTER] (15.0)
-- Delete OLD if NEW is better or equal
DELETE FROM best_current 
WHERE chart_id = 'Ardent_Gaff_MASTER_15.0' 
  AND user_id IN (
    SELECT o.user_id 
    FROM best_current o
    JOIN best_current n ON o.user_id = n.user_id
    WHERE o.chart_id = 'Ardent_Gaff_MASTER_15.0' 
      AND n.chart_id = 'Ardent Gaff_MASTER_15.0'
      AND n.best_score >= o.best_score
  );

-- Delete NEW if OLD is better
DELETE FROM best_current 
WHERE chart_id = 'Ardent Gaff_MASTER_15.0' 
  AND user_id IN (
    SELECT n.user_id 
    FROM best_current o
    JOIN best_current n ON o.user_id = n.user_id
    WHERE o.chart_id = 'Ardent_Gaff_MASTER_15.0' 
      AND n.chart_id = 'Ardent Gaff_MASTER_15.0'
      AND o.best_score > n.best_score
  );

-- Rename remaining OLD to NEW
UPDATE best_current 
SET chart_id = 'Ardent Gaff_MASTER_15.0' 
WHERE chart_id = 'Ardent_Gaff_MASTER_15.0';

-- Update history
UPDATE best_history 
SET chart_id = 'Ardent Gaff_MASTER_15.0' 
WHERE chart_id = 'Ardent_Gaff_MASTER_15.0';


-- 3. Ardent Gaff [INSANITY] (15.9)
-- Delete OLD if NEW is better or equal
DELETE FROM best_current 
WHERE chart_id = 'Ardent_Gaff_INSANITY_15.9' 
  AND user_id IN (
    SELECT o.user_id 
    FROM best_current o
    JOIN best_current n ON o.user_id = n.user_id
    WHERE o.chart_id = 'Ardent_Gaff_INSANITY_15.9' 
      AND n.chart_id = 'Ardent Gaff_INSANITY_15.9'
      AND n.best_score >= o.best_score
  );

-- Delete NEW if OLD is better
DELETE FROM best_current 
WHERE chart_id = 'Ardent Gaff_INSANITY_15.9' 
  AND user_id IN (
    SELECT n.user_id 
    FROM best_current o
    JOIN best_current n ON o.user_id = n.user_id
    WHERE o.chart_id = 'Ardent_Gaff_INSANITY_15.9' 
      AND n.chart_id = 'Ardent Gaff_INSANITY_15.9'
      AND o.best_score > n.best_score
  );

-- Rename remaining OLD to NEW
UPDATE best_current 
SET chart_id = 'Ardent Gaff_INSANITY_15.9' 
WHERE chart_id = 'Ardent_Gaff_INSANITY_15.9';

-- Update history
UPDATE best_history 
SET chart_id = 'Ardent Gaff_INSANITY_15.9' 
WHERE chart_id = 'Ardent_Gaff_INSANITY_15.9';


-- 4. Clean up old chart definitions from the charts master table
DELETE FROM charts WHERE chart_id IN (
  'LAST_PROPOZE_INSANITY_14.6',
  'Ardent_Gaff_MASTER_15.0',
  'Ardent_Gaff_INSANITY_15.9',
  'temp_284_insanity',
  'temp_289_insanity',
  'temp_293_insanity',
  'temp_293_master',
  'temp_296_insanity',
  'temp_298_master',
  'temp_323_master',
  'temp_323_ravage',
  'temp_324_hard',
  'temp_324_insanity',
  'temp_324_master'
);
