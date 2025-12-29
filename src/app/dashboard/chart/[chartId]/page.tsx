import { getDb } from "@/lib/d1";
import { getUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChartDetail, { HistoryRow } from "@/components/ChartDetail";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    chartId: string;
  }>;
}

export default async function ChartDetailPage({ params }: PageProps) {
  const { chartId } = await params;
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  const db = getDb();

  // Fetch Current Best Info
  const currentBest = await db
    .prepare(
      "SELECT title, difficulty, best_score, const_value FROM best_current WHERE user_id = ? AND chart_id = ?"
    )
    .bind(profile.userId, chartId)
    .first<{
      title: string;
      difficulty: string;
      best_score: number;
      const_value: number;
    }>();

  if (!currentBest) {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard" className="text-blue-400 hover:underline mb-4 inline-block">&larr; スコア一覧に戻る</Link>
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-lg text-red-200">
                    楽曲データが見つかりません。
                </div>
            </div>
        </div>
    );
  }

  // Fetch History
  // We explicitly select 'id' to be sure
  const { results: history } = await db
    .prepare(
      "SELECT id, score, observed_at FROM best_history WHERE user_id = ? AND chart_id = ? ORDER BY observed_at DESC LIMIT 100"
    )
    .bind(profile.userId, chartId)
    .all<HistoryRow>();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <Link 
            href="/dashboard" 
            className="text-slate-400 hover:text-white mb-6 inline-flex items-center gap-2 transition-colors"
        >
            &larr; スコア一覧に戻る
        </Link>
        
        <ChartDetail 
            history={history}
            info={{
                title: currentBest.title,
                difficulty: currentBest.difficulty,
                currentBest: currentBest.best_score,
                constValue: currentBest.const_value
            }}
        />
      </div>
    </div>
  );
}
