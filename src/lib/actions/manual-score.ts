"use server";

import { getDb } from "@/lib/d1";
import { upsertScore } from "@/lib/actions/score";
import { revalidatePath } from "next/cache";

export interface ManualChart {
  chart_id: string;
  title: string;
  difficulty: string;
  const_value: number;
}

export interface ManualScoreResult {
  success: boolean;
  message: string;
  isNewRecord?: boolean;
}

/**
 * match_config が NULL の譜面一覧を取得する（CSV未掲載 = 手動記録専用）
 */
export async function getManualCharts(): Promise<ManualChart[]> {
  const db = getDb();
  const result = await db
    .prepare(
      `SELECT chart_id, title, difficulty, const_value
       FROM charts
       WHERE match_config IS NULL
       ORDER BY const_value DESC, title ASC`
    )
    .all<ManualChart>();

  return result.results ?? [];
}

/**
 * 手動でスコアを記録する
 */
export async function submitManualScore(
  userId: string,
  chartId: string,
  score: number
): Promise<ManualScoreResult> {
  // chartId からチャート情報を取得して検証
  const db = getDb();
  const chart = await db
    .prepare(
      `SELECT chart_id, title, difficulty, const_value
       FROM charts
       WHERE chart_id = ? AND match_config IS NULL`
    )
    .bind(chartId)
    .first<ManualChart>();

  if (!chart) {
    return {
      success: false,
      message: "譜面が見つかりません。または手動記録対象外の譜面です。",
    };
  }

  if (score < 0 || score > 1010000 || !Number.isInteger(score)) {
    return {
      success: false,
      message: "スコアは 0〜1,010,000 の整数で入力してください。",
    };
  }

  const result = await upsertScore(
    userId,
    chart.title,
    chart.difficulty,
    chart.const_value,
    score,
    new Date()
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
    message: result.isNewRecord
      ? `「${chart.title}」[${chart.difficulty}] のスコアを更新しました！`
      : `「${chart.title}」[${chart.difficulty}] は既にベストスコア以上の記録があります。`,
    isNewRecord: result.isNewRecord,
  };
}
