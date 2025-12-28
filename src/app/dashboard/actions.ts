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
  const titles = ["Freedom Dive", "Glorious Crown", "Halcyon", "Parousia", "Conflict", "Oshama Scramble", "Brain Power", "Aleph-0", "Test Song A", "Test Song B", "Grievous Lady", "Fracture Ray", "Tempestissimo"];
  const diffs = ["NORMAL", "HARD", "MASTER", "INSANITY", "RAVAGE"];
  
  const title = titles[Math.floor(Math.random() * titles.length)];
  const difficulty = diffs[Math.floor(Math.random() * diffs.length)];
  
  const score = Math.floor(Math.random() * 1000001); // 0 - 1,000,000
  const constValue = 14.0 + Number((Math.random() * 2).toFixed(1)); // 14.0 - 16.0
  
  // Create a predictable ID: title_difficulty (hashed or cleaned)
  // Simple clean: remove spaces, lowercase
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
  const chartId = `${cleanTitle}_${difficulty.toLowerCase()}`;
  
  const observedAt = new Date().toISOString();

  // Insert or Update
  // We explicitly save title and difficulty now
  await db.prepare(`
    INSERT INTO best_current (user_id, chart_id, best_score, best_observed_at, const_value, title, difficulty, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, chart_id) DO UPDATE SET
      best_score = CASE WHEN excluded.best_score > best_current.best_score THEN excluded.best_score ELSE best_current.best_score END,
      best_observed_at = CASE WHEN excluded.best_score > best_current.best_score THEN excluded.best_observed_at ELSE best_current.best_observed_at END,
      const_value = excluded.const_value,
      title = excluded.title, 
      difficulty = excluded.difficulty,
      updated_at = datetime('now')
  `).bind(userId, chartId, score, observedAt, constValue, title, difficulty).run();

  revalidatePath("/dashboard");
}
