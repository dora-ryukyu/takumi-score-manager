'use server'

import { getDb } from "@/lib/d1";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function deleteChartScore(chartId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "認証が必要です。" };
    }

    const db = getDb();
    
    // Delete from best_current
    await db.prepare("DELETE FROM best_current WHERE user_id = ? AND chart_id = ?")
      .bind(userId, chartId)
      .run();

    // Delete from best_history
    await db.prepare("DELETE FROM best_history WHERE user_id = ? AND chart_id = ?")
      .bind(userId, chartId)
      .run();

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/chart/${encodeURIComponent(chartId)}`);

    return { success: true, message: "この譜面の全スコアデータを削除しました。" };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("deleteChartScore error:", e);
    return { success: false, message: `削除中にエラーが発生しました: ${errorMessage}` };
  }
}


