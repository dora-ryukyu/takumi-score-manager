-- chartsテーブルのマイグレーション
-- マスターデータ（譜面定義）を格納するテーブル

CREATE TABLE IF NOT EXISTS charts (
    chart_id TEXT PRIMARY KEY,           -- アプリ内部の一意なID
    title TEXT NOT NULL,                  -- 表示用曲名
    difficulty TEXT NOT NULL,             -- 表示用難易度 (NORMAL, HARD, MASTER, INSANITY, RAVAGE)
    const_value REAL NOT NULL,            -- 譜面定数
    match_config TEXT                     -- CSVマッチング設定（JSON文字列またはNULL）
                                          -- 例: {"csv_difficulty":"INSANITY","csv_level":"15","order":0}
                                          -- NULLの場合はCSVマッチング対象外（HARDのみなど）
);

-- 高速マッチング用インデックス（titleで検索）
CREATE INDEX IF NOT EXISTS idx_charts_title ON charts(title);
