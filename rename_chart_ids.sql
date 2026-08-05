-- 既知曲の正式表記への移行SQL
-- 対象: Voyager（半角カンマ→全角カンマ）と Angel Dust（大文字D→小文字d）
-- 実行: npx wrangler d1 execute score-db --remote --file=rename_chart_ids.sql

-- 1. Voyager: 半角カンマ → 全角カンマ
UPDATE best_current SET
  chart_id = 'Voyager ─24，000，000，000km─_MASTER_13.9',
  title = 'Voyager ─24，000，000，000km─'
WHERE chart_id = 'Voyager ─24,000,000,000km─_MASTER_13.9';

UPDATE best_history SET
  chart_id = 'Voyager ─24，000，000，000km─_MASTER_13.9',
  title = 'Voyager ─24，000，000，000km─'
WHERE chart_id = 'Voyager ─24,000,000,000km─_MASTER_13.9';

-- 2. Angel Dust → Angel dust（大文字D → 小文字d）
-- INSANITY / MASTER / HARD の3譜面すべて
UPDATE best_current SET
  chart_id = REPLACE(chart_id, 'Angel Dust_', 'Angel dust_'),
  title = REPLACE(title, 'Angel Dust', 'Angel dust')
WHERE chart_id LIKE 'Angel Dust_%';

UPDATE best_history SET
  chart_id = REPLACE(chart_id, 'Angel Dust_', 'Angel dust_'),
  title = REPLACE(title, 'Angel Dust', 'Angel dust')
WHERE chart_id LIKE 'Angel Dust_%';
