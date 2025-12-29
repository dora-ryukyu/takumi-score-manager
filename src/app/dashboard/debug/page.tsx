import Link from "next/link";
import DebugScoreForm from "@/components/DebugScoreForm";

export default function DebugPage() {
  return (
    <div className="container mx-auto p-4 min-h-screen bg-[var(--color-background)]">
      <Link href="/dashboard" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; スコア一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold mb-6 text-[var(--color-foreground)]">デバッグメニュー</h1>
      <DebugScoreForm />
    </div>
  );
}
