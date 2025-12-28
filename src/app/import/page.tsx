import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth";
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet } from "lucide-react";

export default async function ImportPage() {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--color-foreground)] opacity-70 hover:opacity-100 transition-opacity">
           <ArrowLeft size={20} />
           <span>ダッシュボードに戻る</span>
        </Link>

        <div className="bg-[var(--color-card-bg)] rounded-2xl p-8 border border-[var(--color-header-border)] flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
               <FileSpreadsheet size={32} />
            </div>
            
            <h1 className="text-2xl font-bold">CSVインポート</h1>
            
            <p className="text-[var(--color-foreground)] opacity-70">
                CSVファイルからのスコア一括登録は現在準備中です。<br />
                今後のアップデートをお待ちください。
            </p>
        </div>
      </div>
    </div>
  );
}
