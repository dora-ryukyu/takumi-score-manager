-- schema.sql

-- ユーザー管理
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    display_name TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 最新ベストスコア（譜面定数 const_value を含む）
CREATE TABLE IF NOT EXISTS best_current (
    user_id TEXT NOT NULL,
    chart_id TEXT NOT NULL,
    title TEXT,
    difficulty TEXT,
    best_score INTEGER NOT NULL,
    best_observed_at TEXT NOT NULL,
    const_value REAL,
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, chart_id)
);

-- スコア履歴
CREATE TABLE IF NOT EXISTS best_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    chart_id TEXT NOT NULL,
    title TEXT,
    difficulty TEXT,
    score INTEGER NOT NULL,
    observed_at TEXT NOT NULL,
    const_value REAL
);
CREATE INDEX IF NOT EXISTS idx_history_user_chart_date ON best_history(user_id, chart_id, observed_at DESC);

-- インポートログ
CREATE TABLE IF NOT EXISTS import_log (
    import_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    file_hash TEXT,
    rows_total INTEGER,
    rows_parsed INTEGER,
    rows_updated INTEGER,
    status TEXT,
    error_summary TEXT
);

-- ランク閾値（マスタ）
CREATE TABLE IF NOT EXISTS rank_thresholds (
    rank TEXT PRIMARY KEY,
    min_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    sort_order INTEGER NOT NULL,
    updated_at TEXT NOT NULL
);

-- 統計情報（日次）
CREATE TABLE IF NOT EXISTS chart_stats_daily (
    date TEXT NOT NULL,
    chart_id TEXT NOT NULL,
    n_total INTEGER DEFAULT 0,
    n_s INTEGER DEFAULT 0,
    rate_s REAL DEFAULT 0.0,
    computed_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (date, chart_id)
);