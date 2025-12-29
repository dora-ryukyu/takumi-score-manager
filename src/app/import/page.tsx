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
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)]">CSVインポート</h1>
            <p className="text-[var(--color-foreground)] opacity-70 mt-1">
              公式のエクスポートデータを取り込みます
            </p>
          </div>
        </header>

        <div className="bg-[var(--color-card-bg)] rounded-2xl p-8 border border-[var(--color-header-border)] flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
               <FileSpreadsheet size={32} />
            </div>
            
            <h3 className="text-xl font-bold">準備中</h3>
            
            <p className="text-[var(--color-foreground)] opacity-70">
                CSVファイルからのスコア一括登録は現在準備中です。<br />
                今後のアップデートをお待ちください。
            </p>
        </div>
      </div>
    </div>
  );
}
