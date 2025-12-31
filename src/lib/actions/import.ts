"use server";

import { getDb } from "@/lib/d1";
import { upsertScore } from "./score";
import { revalidatePath } from "next/cache";

/**
 * ファイルサイズ上限（100KB）
 * CSVは約15KB程度なので、余裕を持って100KBに設定
 */
const MAX_FILE_SIZE_BYTES = 100 * 1024; // 100KB

/**
 * CSVインポート結果
 */
export interface ImportResult {
  success: boolean;
  totalRows: number;      // CSVの総行数
  matchedRows: number;    // マッチに成功した行数
  updatedRows: number;    // 実際に更新された行数
  warnings: string[];     // 警告メッセージ
  error?: string;         // エラーメッセージ
}

/**
 * CSVの行データ
 */
interface CsvRow {
  title: string;
  difficulty: string;
  level: string;  // 文字列に変更（"15+", "13"など）
  score: number;
  originalIndex: number;  // CSV内での元の行番号（デバッグ用）
}

/**
 * chartsテーブルのエントリー（新スキーマ対応）
 * match_configがnullの場合はマッチング対象外（HARDのみなど）
 */
interface ChartEntry {
  chart_id: string;
  title: string;
  difficulty: string;
  const_value: number;
  match_config: string | null;  // JSON文字列またはnull
}

/**
 * match_configのパース後の型
 */
interface MatchConfig {
  csv_difficulty: string;  // 正式名称（例: "INSANITY", "MASTER"）
  csv_level: string;       // 文字列（例: "15+", "13"）
  order: number;           // 同一条件内での出現順序（0始まり）
}

/**
 * フィールド値の表記ゆれを正規化する
 * CSVパース後の各フィールドに適用
 * 
 * @param value フィールド値
 * @returns 正規化された値
 */
function normalizeFieldValue(value: string): string {
  return value
    // 半角チルダ ~ -> 全角 ～ (表記ゆれ防止)
    .replace(/~/g, '～')
    // バックスラッシュ \ -> 全角 ＼ (エスケープバグ防止)
    .replace(/\\/g, '＼')
    // 半角カンマ , -> 全角 ， (タイトル内のカンマ)
    .replace(/,/g, '，');
}

/**
 * CSV行を正しくパースする（クォート付きフィールド対応）
 * RFC 4180準拠のシンプルなCSVパーサー
 * 
 * @param line CSV行
 * @returns フィールドの配列
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        // 次の文字もダブルクォートなら、エスケープされたダブルクォート
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        } else {
          // クォート終了
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        current += char;
        i++;
      }
    } else {
      if (char === '"') {
        // クォート開始
        inQuotes = true;
        i++;
      } else if (char === ',') {
        // フィールド区切り
        fields.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  // 最後のフィールドを追加
  fields.push(current.trim());

  return fields;
}

/**
 * CSVをパースして行データの配列を返す
 * @param csvContent CSVファイルの内容
 * @returns パース結果（行データ配列とエラー）
 */
function parseCsv(csvContent: string): { rows: CsvRow[]; error?: string } {
  // UTF-8 BOMを除去
  const content = csvContent.replace(/^\uFEFF/, '');
  
  const lines = content.trim().split(/\r?\n/);

  if (lines.length < 2) {
    return { rows: [], error: "CSVにデータ行がありません" };
  }

  // ヘッダー行をスキップ（1行目はヘッダーと仮定）
  const dataLines = lines.slice(1);
  const rows: CsvRow[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue; // 空行をスキップ

    // CSVを正しくパース（クォート対応）
    const parts = parseCSVLine(line);

    if (parts.length < 4) {
      // カラム数が足りない場合は警告して続行
      console.warn(`行 ${i + 2}: カラム数不足（${parts.length}/4）、スキップ`);
      continue;
    }

    const [rawTitle, rawDifficulty, rawLevel, scoreStr] = parts;

    const score = parseInt(scoreStr, 10);

    if (isNaN(score)) {
      console.warn(`行 ${i + 2}: スコアが数値でない、スキップ`);
      continue;
    }

    // フィールド値を正規化（表記ゆれ対応）
    const title = normalizeFieldValue(rawTitle);
    const difficulty = rawDifficulty.trim().toUpperCase();  // 難易度は大文字に統一
    const level = rawLevel.trim();

    rows.push({
      title,
      difficulty,
      level,
      score,
      originalIndex: i + 2, // 1始まり + ヘッダー分
    });
  }

  return { rows };
}

/**
 * CSVスコアインポート処理
 * 
 * 相対順序マッチングアルゴリズム:
 * 1. CSV全体をパースし、(曲名, 難易度, レベル)でグルーピング
 * 2. DBのchartsテーブル全件をループ
 * 3. 各チャートのmatch_configでグループから行を取得し、order番目の行をマッチ
 * 
 * @param userId ユーザーID
 * @param csvContent CSVファイルの内容
 * @param observedAt 観測日時
 * @returns インポート結果
 */
export async function importScores(
  userId: string,
  csvContent: string,
  observedAt: Date
): Promise<ImportResult> {
  const warnings: string[] = [];

  try {
    // 0. ファイルサイズチェック（バックエンドで厳密に制限）
    const contentSizeBytes = new TextEncoder().encode(csvContent).length;
    if (contentSizeBytes > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        totalRows: 0,
        matchedRows: 0,
        updatedRows: 0,
        warnings: [],
        error: `ファイルサイズが上限（${MAX_FILE_SIZE_BYTES / 1024}KB）を超えています。現在のサイズ: ${(contentSizeBytes / 1024).toFixed(1)}KB`,
      };
    }

    // 1. CSVパース（BOM除去、クォート処理、正規化含む）
    const { rows, error: parseError } = parseCsv(csvContent);
    if (parseError) {
      return {
        success: false,
        totalRows: 0,
        matchedRows: 0,
        updatedRows: 0,
        warnings: [],
        error: parseError,
      };
    }

    if (rows.length === 0) {
      return {
        success: false,
        totalRows: 0,
        matchedRows: 0,
        updatedRows: 0,
        warnings: [],
        error: "有効なデータ行がありません",
      };
    }

    // 2. グルーピング: キー = "${title}_${difficulty}_${level}"
    const groupedRows = new Map<string, CsvRow[]>();
    for (const row of rows) {
      const key = `${row.title}_${row.difficulty}_${row.level}`;
      if (!groupedRows.has(key)) {
        groupedRows.set(key, []);
      }
      groupedRows.get(key)!.push(row);
    }

    // 3. DBからchartsテーブル全件を取得
    const db = getDb();
    const chartsResult = await db
      .prepare("SELECT chart_id, title, difficulty, const_value, match_config FROM charts ORDER BY title")
      .all<ChartEntry>();

    if (!chartsResult.results || chartsResult.results.length === 0) {
      return {
        success: false,
        totalRows: rows.length,
        matchedRows: 0,
        updatedRows: 0,
        warnings: [],
        error: "chartsテーブルにマスターデータがありません。先にシードを実行してください。",
      };
    }

    const charts = chartsResult.results;
    let matchedRows = 0;
    let updatedRows = 0;

    // 4. 各チャートに対してマッチング処理
    for (const chart of charts) {
      // match_configがnullの場合はマッチング対象外（HARDのみなど）
      if (!chart.match_config) {
        continue;
      }

      // match_configをパース
      let matchConfig: MatchConfig;
      try {
        matchConfig = JSON.parse(chart.match_config) as MatchConfig;
      } catch {
        console.warn(`チャート ${chart.chart_id}: match_configのパースに失敗`);
        continue;
      }

      // グループキーを生成（正式名称の難易度とレベル文字列で）
      const key = `${chart.title}_${matchConfig.csv_difficulty}_${matchConfig.csv_level}`;
      const rowList = groupedRows.get(key);

      if (!rowList) {
        // このチャートに対応するCSV行が存在しない
        continue;
      }

      // order番目の行を取得
      if (rowList.length <= matchConfig.order) {
        // 行リストの長さが足りない場合は警告
        warnings.push(
          `「${chart.title}」(${chart.difficulty}): 期待される行順序${matchConfig.order}に対して、CSV内に${rowList.length}行しかありません`
        );
        continue;
      }

      const matchedRow = rowList[matchConfig.order];
      matchedRows++;

      // 5. upsertScore を呼び出して保存
      const result = await upsertScore(
        userId,
        chart.title,
        chart.difficulty,
        chart.const_value,
        matchedRow.score,
        observedAt
      );

      if (result.success && result.isNewRecord) {
        updatedRows++;
      }
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      totalRows: rows.length,
      matchedRows,
      updatedRows,
      warnings,
    };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("importScores error:", e);
    return {
      success: false,
      totalRows: 0,
      matchedRows: 0,
      updatedRows: 0,
      warnings,
      error: `インポート中にエラーが発生しました: ${errorMessage}`,
    };
  }
}
