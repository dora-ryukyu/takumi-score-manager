-- seed.sql
DELETE FROM rank_thresholds;

INSERT INTO rank_thresholds (rank, min_score, max_score, sort_order, updated_at) VALUES
('S+', 995000, 1000000, 1, datetime('now')),
('S',  990000,  994999, 2, datetime('now')),
('AAA',970000,  989999, 3, datetime('now')),
('AA', 950000,  969999, 4, datetime('now')),
('A',  900000,  949999, 5, datetime('now')),
('BBB',850000,  899999, 6, datetime('now')),
('BB', 800000,  849999, 7, datetime('now')),
('B',  700000,  799999, 8, datetime('now')),
('C',       0,  699999, 9, datetime('now'));