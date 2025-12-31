/**
 * charts.json をD1データベースにUPSERTするシードスクリプト
 * 
 * 使い方:
 *   npx wrangler d1 execute score-db --local --file=add_charts_table.sql  # マイグレーション
 *   npx tsx scripts/seed-charts.ts                                        # ローカルシード
 *   npx tsx scripts/seed-charts.ts --remote                               # 本番シード
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// charts.json の読み込み
const chartsPath = path.join(__dirname, '../src/data/charts.json');

interface MatchConfig {
  csv_difficulty: string;
  csv_level: string;
  order: number;
}

interface ChartData {
  chart_id: string;
  title: string;
  difficulty: string;
  const_value: number;
  match_config: MatchConfig | null;
}

function main() {
  // コマンドライン引数をチェック
  const isRemote = process.argv.includes('--remote');
  const target = isRemote ? '' : '--local';

  console.log(`🔧 シード対象: ${isRemote ? '本番環境' : 'ローカル'}`);

  // charts.json を読み込む
  if (!fs.existsSync(chartsPath)) {
    console.error('❌ src/data/charts.json が見つかりません');
    process.exit(1);
  }

  const chartsData: ChartData[] = JSON.parse(fs.readFileSync(chartsPath, 'utf-8'));
  console.log(`📊 ${chartsData.length} 件のチャートを読み込みました`);

  // SQLファイルを一時的に生成
  const sqlStatements: string[] = [];

  for (const chart of chartsData) {
    // SQLインジェクション防止のためのエスケープ（シングルクォートを二重化）
    const escapedTitle = chart.title.replace(/'/g, "''");
    const escapedDifficulty = chart.difficulty.replace(/'/g, "''");
    const escapedChartId = chart.chart_id.replace(/'/g, "''");

    // match_configをJSON文字列に変換（nullの場合はNULL）
    let matchConfigSql: string;
    if (chart.match_config === null) {
      matchConfigSql = 'NULL';
    } else {
      const matchConfigJson = JSON.stringify(chart.match_config).replace(/'/g, "''");
      matchConfigSql = `'${matchConfigJson}'`;
    }

    sqlStatements.push(`
INSERT INTO charts (chart_id, title, difficulty, const_value, match_config)
VALUES ('${escapedChartId}', '${escapedTitle}', '${escapedDifficulty}', ${chart.const_value}, ${matchConfigSql})
ON CONFLICT(chart_id) DO UPDATE SET
  title = excluded.title,
  difficulty = excluded.difficulty,
  const_value = excluded.const_value,
  match_config = excluded.match_config;
`.trim());
  }

  // 一時SQLファイルに書き込み
  const tempSqlPath = path.join(__dirname, 'temp_seed.sql');
  fs.writeFileSync(tempSqlPath, sqlStatements.join('\n'));

  console.log('📝 一時SQLファイルを生成しました');

  try {
    // wrangler d1 execute でSQLを実行
    const command = `npx wrangler d1 execute score-db ${target} --file=${tempSqlPath}`;
    console.log(`🚀 実行中: ${command}`);
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log(`✅ ${chartsData.length} 件のチャートを正常にシードしました`);
  } catch (error) {
    console.error('❌ シード処理中にエラーが発生しました:', error);
    process.exit(1);
  } finally {
    // 一時ファイルを削除
    if (fs.existsSync(tempSqlPath)) {
      fs.unlinkSync(tempSqlPath);
    }
  }
}

main();
