'use server'

import { getDb } from "@/lib/d1";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function addDummyScore() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  // Generate random data
  const score = Math.floor(Math.random() * 1000001); // 0 - 1,000,000
  const constValue = 14.0 + Number((Math.random()).toFixed(1)); // 14.0 - 15.0 approx
  const chartId = `song_${Math.floor(Math.random() * 20)}_master`; // Reduce range to get collisions
  const observedAt = new Date().toISOString();

  // Insert or Update if score is higher
  // For debug purposes, let's just force update to see changes immediately if we hit the same song
  // Or stick to logic: MAX(score).
  // I will use logic MAX(score) to be realistic.

  await db.prepare(`
    INSERT INTO best_current (user_id, chart_id, best_score, best_observed_at, const_value, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, chart_id) DO UPDATE SET
      best_score = CASE WHEN excluded.best_score > best_current.best_score THEN excluded.best_score ELSE best_current.best_score END,
      best_observed_at = CASE WHEN excluded.best_score > best_current.best_score THEN excluded.best_observed_at ELSE best_current.best_observed_at END,
      const_value = excluded.const_value,
      updated_at = datetime('now')
  `).bind(userId, chartId, score, observedAt, constValue).run();

  revalidatePath("/dashboard");
}
