import { redirect } from "next/navigation";
import { getDb } from "@/lib/d1";
import { getUserProfile } from "@/lib/auth";
import ImageGenClient from "./ImageGenClient";

// Type for the database row
interface ScoreRow {
  chart_id: string;
  best_score: number;
  const_value: number | null;
  title: string | null;
  difficulty: string | null;
  updated_at: string;
}

export default async function ImageGenPage() {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/sign-in");
  }

  const { userId, displayName, imageUrl } = profile;

  // Fetch Scores (Same as Dashboard)
  const db = getDb();
  const { results } = await db.prepare(`
    SELECT chart_id, best_score, const_value, title, difficulty, updated_at
    FROM best_current 
    WHERE user_id = ? 
    ORDER BY best_score DESC
  `).bind(userId).all<ScoreRow>();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)]">ベスト枠画像生成</h1>
            <p className="text-[var(--color-foreground)] opacity-70 mt-1">
              ベストスコア画像を生成してSNSでシェアしましょう
            </p>
          </div>
        </header>

        <ImageGenClient 
          initialScores={results} 
          userName={displayName} 
          userImage={imageUrl} 
        />
      </div>
    </div>
  );
}
