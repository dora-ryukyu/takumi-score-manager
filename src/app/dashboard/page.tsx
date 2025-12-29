import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/d1";
import { addDummyScore } from "./actions";
import ScoreListClient from "./ScoreListClient";
import { getUserProfile } from "@/lib/auth";

// Type for the database row
interface ScoreRow {
  chart_id: string;
  best_score: number;
  const_value: number | null;
  title: string | null;
  difficulty: string | null;
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
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/sign-in");
  }

  const { userId, displayName, imageUrl } = profile;

  // 2. Fetch Scores
  const db = getDb();
  // We include updated_at here
  const { results } = await db.prepare(`
    SELECT chart_id, best_score, const_value, title, difficulty, updated_at
    FROM best_current 
    WHERE user_id = ? 
    ORDER BY best_score DESC
  `).bind(userId).all<ScoreRow>();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)]">スコア一覧</h1>
            <p className="text-[var(--color-foreground)] opacity-70 mt-1">
              あなたの現在のベストスコア一覧
            </p>
          </div>
          
          {/* Debug button removed */}
        </header>

        {/* Client Component for Sortable List & Stats */}
        <ScoreListClient 
          initialScores={results} 
          userName={displayName} 
          userImage={imageUrl}
        />
        
      </div>
    </div>
  );
}
