import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth";
import ImportForm from "./ImportForm";
import { getManualCharts } from "@/lib/actions/manual-score";
import { getExternalUserId } from "@/app/settings/actions";

export default async function ImportPage() {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/sign-in");
  }

  const manualCharts = await getManualCharts();
  const savedExternalUserId = await getExternalUserId();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)]">スコアインポート</h1>
            <p className="text-[var(--color-foreground)] opacity-70 mt-1">
              TAKUMI³のスコアデータを取り込みます
            </p>
          </div>
        </header>

        <ImportForm userId={profile.userId} manualCharts={manualCharts} savedExternalUserId={savedExternalUserId} />
      </div>
    </div>
  );
}
