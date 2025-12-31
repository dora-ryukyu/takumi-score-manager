import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth";
import ImportForm from "./ImportForm";

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
              TAKUMI3のエクスポートデータを取り込みます
            </p>
          </div>
        </header>

        <ImportForm userId={profile.userId} />
      </div>
    </div>
  );
}

