import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth";
import { getExternalUserId } from "./actions";
import ProfileForm from "./ProfileForm";
import DeleteDataButton from "./DeleteDataButton";

export default async function SettingsPage() {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/sign-in");
  }

  const externalUserId = await getExternalUserId();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)]">設定</h1>
            <p className="text-[var(--color-foreground)] opacity-70 mt-1">
              プロフィールなどの設定を変更します
            </p>
          </div>
        </header>

        <ProfileForm profile={profile} externalUserId={externalUserId} />

        {/* Danger Zone */}
        <div className="bg-[var(--color-card-bg)] p-8 rounded-xl shadow-sm border border-red-500/30">
          <h2 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-foreground)] opacity-70">
              この操作を行うと、全てのスコアデータ、履歴、設定が削除されます。<br />
              削除されたデータは復元できません。
            </p>
            <DeleteDataButton />
          </div>
        </div>
      </div>
    </div>
  );
}


