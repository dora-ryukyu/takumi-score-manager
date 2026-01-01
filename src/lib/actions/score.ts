"use server";

import { getDb } from "@/lib/d1";
import { revalidatePath } from "next/cache";

// Helper to generate consistent Chart ID
// Format: title_difficulty_constValue (matches charts.json, always with .0 decimal)
function generateChartId(title: string, difficulty: string, constValue: number): string {
  return `${title}_${difficulty}_${constValue.toFixed(1)}`;
}

export type UpsertScoreResult = {
  success: boolean;
  message: string;
  chartId?: string;
  isNewRecord?: boolean;
};

export async function upsertScore(
  userId: string,
  title: string,
  difficulty: string,
  constValue: number,
  newScore: number,
  observedAt: Date
): Promise<UpsertScoreResult> {
  try {
    const db = getDb();
    const chartId = generateChartId(title, difficulty, constValue);
    const observedAtIso = observedAt.toISOString();

    // 2. Fetch Current Best
    // We select specifically for this user and chart
    const currentBestStmt = await db
      .prepare(
        "SELECT best_score FROM best_current WHERE user_id = ? AND chart_id = ?"
      )
      .bind(userId, chartId)
      .first<{ best_score: number }>();

    const currentBestScore = currentBestStmt?.best_score ?? -1;

    // 3. Comparison Logic
    if (currentBestStmt && newScore <= currentBestScore) {
        // Record exists AND newScore <= currentBest: DO NOTHING
        return {
            success: true, 
            message: "Not updated (Score is not higher than current best)",
            chartId,
            isNewRecord: false
        };
    }

    // If record doesn't exist OR newScore > currentBest
    // UPDATE/INSERT best_current
    await db.prepare(
        `INSERT INTO best_current (user_id, chart_id, title, difficulty, best_score, best_observed_at, const_value, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(user_id, chart_id) DO UPDATE SET
            best_score = excluded.best_score,
            best_observed_at = excluded.best_observed_at,
            const_value = excluded.const_value,
            updated_at = datetime('now')`
    ).bind(userId, chartId, title, difficulty, newScore, observedAtIso, constValue).run();

    // INSERT into best_history
    await db.prepare(
        `INSERT INTO best_history (user_id, chart_id, title, difficulty, score, observed_at, const_value)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(userId, chartId, title, difficulty, newScore, observedAtIso, constValue).run();

    // TRIM History (Keep newest 100)
    // We can do this safely by finding the 100th newest record and deleting anything older
    // or just a simple DELETE with subquery
    // SQLite D1 might support LIMIT/OFFSET in DELETE, but standard SQL is DELETE WHERE id NOT IN (...)
    
    // Let's rely on specific logic: 
    // Get IDs of the newest 100 records for this user/chart
    // Delete records NOT in that list for this user/chart
    
    // Better yet, just count first. If > 100, delete oldest.
    // Ideally we want to keep exactly 100.
    
    // Subquery approach:
    // DELETE FROM best_history 
    // WHERE user_id = ? AND chart_id = ? 
    // AND id NOT IN (
    //   SELECT id FROM best_history 
    //   WHERE user_id = ? AND chart_id = ? 
    //   ORDER BY observed_at DESC 
    //   LIMIT 100
    // )
    
    await db.prepare(
        `DELETE FROM best_history 
         WHERE user_id = ? AND chart_id = ? 
         AND id NOT IN (
           SELECT id FROM best_history 
           WHERE user_id = ? AND chart_id = ? 
           ORDER BY observed_at DESC 
           LIMIT 100
         )`
    ).bind(userId, chartId, userId, chartId).run();

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/chart/${encodeURIComponent(chartId)}`);

    return {
        success: true,
        message: "Updated successfully",
        chartId,
        isNewRecord: true
    };

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("upsertScore error:", e);
    return {
        success: false,
        message: `Error: ${errorMessage}`
    };
  }
}

/**
 * バッチスコア更新用の入力型
 */
export interface BatchScoreInput {
  chartId: string;
  title: string;
  difficulty: string;
  constValue: number;
  score: number;
}

/**
 * バッチスコア更新結果
 */
export interface BatchUpsertResult {
  success: boolean;
  totalProcessed: number;
  updatedCount: number;
  error?: string;
}

/**
 * 複数スコアを一括で更新する（CSVインポート最適化用）
 * D1のbatch APIを使用して、N+1問題を解消
 * 
 * @param userId ユーザーID
 * @param scores スコアの配列
 * @param observedAt 観測日時
 * @returns バッチ処理結果
 */
export async function batchUpsertScores(
  userId: string,
  scores: BatchScoreInput[],
  observedAt: Date
): Promise<BatchUpsertResult> {
  if (scores.length === 0) {
    return { success: true, totalProcessed: 0, updatedCount: 0 };
  }

  try {
    const db = getDb();
    const observedAtIso = observedAt.toISOString();

    // 1. 一括で現在のベストスコアを取得
    const chartIds = scores.map(s => s.chartId);
    const placeholders = chartIds.map(() => '?').join(',');
    const currentBests = await db
      .prepare(
        `SELECT chart_id, best_score FROM best_current 
         WHERE user_id = ? AND chart_id IN (${placeholders})`
      )
      .bind(userId, ...chartIds)
      .all<{ chart_id: string; best_score: number }>();

    // 現在のスコアをMapに変換
    const currentScoreMap = new Map<string, number>();
    if (currentBests.results) {
      for (const row of currentBests.results) {
        currentScoreMap.set(row.chart_id, row.best_score);
      }
    }

    // 2. 更新が必要なスコアをフィルタリング
    const scoresToUpdate: BatchScoreInput[] = [];
    for (const score of scores) {
      const currentBest = currentScoreMap.get(score.chartId);
      // レコードが存在しない OR 新スコアが現在のベストより高い場合のみ更新
      if (currentBest === undefined || score.score > currentBest) {
        scoresToUpdate.push(score);
      }
    }

    if (scoresToUpdate.length === 0) {
      return { success: true, totalProcessed: scores.length, updatedCount: 0 };
    }

    // 3. バッチ処理用のステートメントを準備
    const statements: D1PreparedStatement[] = [];

    for (const score of scoresToUpdate) {
      // best_current への UPSERT
      statements.push(
        db.prepare(
          `INSERT INTO best_current (user_id, chart_id, title, difficulty, best_score, best_observed_at, const_value, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(user_id, chart_id) DO UPDATE SET
              best_score = excluded.best_score,
              best_observed_at = excluded.best_observed_at,
              const_value = excluded.const_value,
              updated_at = datetime('now')`
        ).bind(userId, score.chartId, score.title, score.difficulty, score.score, observedAtIso, score.constValue)
      );

      // best_history への INSERT
      statements.push(
        db.prepare(
          `INSERT INTO best_history (user_id, chart_id, title, difficulty, score, observed_at, const_value)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(userId, score.chartId, score.title, score.difficulty, score.score, observedAtIso, score.constValue)
      );
    }

    // 4. バッチ実行（D1のbatch APIで一括処理）
    await db.batch(statements);

    // 5. 履歴トリム（更新があったチャートのみ、一括で実行）
    const updatedChartIds = scoresToUpdate.map(s => s.chartId);
    const trimStatements: D1PreparedStatement[] = [];
    
    for (const chartId of updatedChartIds) {
      trimStatements.push(
        db.prepare(
          `DELETE FROM best_history 
           WHERE user_id = ? AND chart_id = ? 
           AND id NOT IN (
             SELECT id FROM best_history 
             WHERE user_id = ? AND chart_id = ? 
             ORDER BY observed_at DESC 
             LIMIT 100
           )`
        ).bind(userId, chartId, userId, chartId)
      );
    }

    // トリム処理もバッチで実行
    if (trimStatements.length > 0) {
      await db.batch(trimStatements);
    }

    // 6. revalidatePathは1回だけ（呼び出し元で行う）
    // ここでは行わない

    return {
      success: true,
      totalProcessed: scores.length,
      updatedCount: scoresToUpdate.length
    };

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("batchUpsertScores error:", e);
    return {
      success: false,
      totalProcessed: scores.length,
      updatedCount: 0,
      error: `バッチ処理中にエラーが発生しました: ${errorMessage}`
    };
  }
}

export async function clearUserData(userId: string) {
    const db = getDb();
    await db.prepare("DELETE FROM best_current WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM best_history WHERE user_id = ?").bind(userId).run();
    revalidatePath("/dashboard");
    return { success: true, message: "Cleared all data" };
}
