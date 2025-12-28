import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/d1";
import { calculateSongContrib, calculateDisplayRate } from "@/lib/rating";
import { getRank } from "@/lib/rank";
import { addDummyScore } from "./actions";

// Type for the database row
interface ScoreRow {
  chart_id: string;
  best_score: number;
  const_value: number | null;
  updated_at: string;
}

// 1. User Synchronization Logic
async function syncUser(userId: string) {
  const db = getDb();
  // Check if user exists
  const existing = await db.prepare("SELECT user_id FROM users WHERE user_id = ?").bind(userId).first();
  
  if (!existing) {
    // Insert new user
    await db.prepare("INSERT INTO users (user_id) VALUES (?)").bind(userId).run();
    console.log(`[Sync] Created new user: ${userId}`);
  }
}

export default async function DashboardPage() {
  // Auth Check
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Sync User
  await syncUser(userId);

  // 2. Fetch Scores
  const db = getDb();
  // We include updated_at here
  const { results } = await db.prepare(`
    SELECT chart_id, best_score, const_value, updated_at
    FROM best_current 
    WHERE user_id = ? 
    ORDER BY best_score DESC
  `).bind(userId).all<ScoreRow>();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 sm:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">ダッシュボード</h1>
            <p className="text-slate-500 mt-1">
              あなたの現在のベストスコア状況
            </p>
          </div>
          
          <form action={addDummyScore}>
            <button 
              type="submit"
              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
            >
              デバッグ用: ダミーデータ追加
            </button>
          </form>
        </header>

        {/* Scores Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">楽曲ID / 難易度</th>
                  <th className="px-6 py-4 text-right">スコア</th>
                  <th className="px-6 py-4 text-center">ランク</th>
                  <th className="px-6 py-4 text-center">譜面定数</th>
                  <th className="px-6 py-4 text-right">単曲レート</th>
                  <th className="px-6 py-4 text-right">更新日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <p className="mb-2 text-lg font-medium text-slate-700">データがありません</p>
                      <p className="text-sm">CSVをインポートするか、デバッグボタンを押してください。</p>
                    </td>
                  </tr>
                ) : (
                  results.map((row) => {
                    const constVal = row.const_value ?? 0;
                    const contrib = calculateSongContrib(row.best_score, constVal);
                    const ratingDisplay = calculateDisplayRate(contrib);
                    const rank = getRank(row.best_score);
                    
                    // Format date
                    const date = new Date(row.updated_at).toLocaleDateString("ja-JP", {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    });

                    // Highlight high rating
                    const isHighRating = contrib >= 20.0; // Arbitrary high value threshold just for styling logic check, but let's just make it bold blue.

                    return (
                      <tr 
                        key={row.chart_id} 
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium font-mono text-slate-700">
                          {row.chart_id}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-base tabular-nums">
                          {row.best_score.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`
                            inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold leading-none min-w-[3rem]
                            ${getRankColorClass(rank)}
                          `}>
                            {rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 tabular-nums">
                          {constVal.toFixed(1)}
                        </td>
                        <td className={`px-6 py-4 text-right font-bold tabular-nums ${isHighRating ? 'text-blue-600' : 'text-slate-700'}`}>
                          {ratingDisplay}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400 text-xs tabular-nums">
                          {date}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRankColorClass(rank: string) {
  switch (rank) {
    case "S+": return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    case "S":  return "bg-amber-100 text-amber-700 border border-amber-200";
    case "AAA": return "bg-purple-100 text-purple-700 border border-purple-200";
    case "AA": return "bg-indigo-100 text-indigo-700 border border-indigo-200";
    case "A":  return "bg-blue-100 text-blue-700 border border-blue-200";
    case "BBB": return "bg-sky-100 text-sky-700 border border-sky-200";
    case "BB": return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "B":  return "bg-teal-100 text-teal-700 border border-teal-200";
    default:   return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}
