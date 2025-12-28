import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/d1";
import { addDummyScore } from "./actions";
import ScoreListClient from "./ScoreListClient";

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
  const existing = await db.prepare("SELECT user_id FROM users WHERE user_id = ?").bind(userId).first();
  if (!existing) {
    await db.prepare("INSERT INTO users (user_id) VALUES (?)").bind(userId).run();
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // User Info (for Greeting)
  const user = await currentUser();
  const userName = user?.firstName || user?.username || "Player";

  await syncUser(userId);

  // 2. Fetch Scores
  const db = getDb();
  const { results } = await db.prepare(`
    SELECT chart_id, best_score, const_value, updated_at
    FROM best_current 
    WHERE user_id = ? 
    ORDER BY best_score DESC
  `).bind(userId).all<ScoreRow>();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">スコア管理</h1>
            <p className="text-slate-500 mt-1">
              あなたの現在のベストスコア一覧
            </p>
          </div>
          
          <form action={addDummyScore}>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              デバッグ用: ダミーデータ追加
            </button>
          </form>
        </header>

        {/* Client Component for Sortable List & Stats */}
        <ScoreListClient initialScores={results} userName={userName} />
        
      </div>
    </div>
  );
}
