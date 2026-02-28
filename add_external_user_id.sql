-- external_user_id カラムを users テーブルに追加
-- takumi3scoretool の直接インポート用ユーザーID
ALTER TABLE users ADD COLUMN external_user_id TEXT DEFAULT NULL;
