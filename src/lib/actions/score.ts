"use server";

import { getDb } from "@/lib/d1";
import { revalidatePath } from "next/cache";

// Helper to generate consistent Chart ID
async function generateChartId(title: string, difficulty: string, constValue: number): Promise<string> {
  const data = new TextEncoder().encode(`${title}:${difficulty}:${constValue}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
    const chartId = await generateChartId(title, difficulty, constValue);
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
    revalidatePath(`/dashboard/chart/${chartId}`);

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

export async function clearUserData(userId: string) {
    // For debug purposes
    const db = getDb();
    await db.prepare("DELETE FROM best_current WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM best_history WHERE user_id = ?").bind(userId).run();
    revalidatePath("/dashboard");
    return { success: true, message: "Cleared all data" };
}
