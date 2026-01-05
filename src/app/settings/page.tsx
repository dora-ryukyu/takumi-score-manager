import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth";
import { updateProfile } from "./actions";
import Image from "next/image";
import DeleteDataButton from "./DeleteDataButton";

export default async function SettingsPage() {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/sign-in");
  }

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

        <div className="bg-[var(--color-card-bg)] p-8 rounded-xl shadow-sm border border-[var(--color-header-border)]">
          <form action={updateProfile} className="space-y-6">
            
            {/* User Icon Display (Read-only) */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[var(--color-header-border)] bg-[var(--color-menu-hover)]">
                <Image 
                  src={profile.imageUrl} 
                  alt={profile.displayName} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="text-sm text-[var(--color-foreground)] opacity-60">
                <p>アイコンはClerkアカウントのものが使用されます。右上のアイコン→&quot;Manage account&quot;→&quot;Profile&quot;から変更可能です。</p>
              </div>
            </div>

            {/* Display Name Input */}
            <div className="space-y-2">
              <label htmlFor="display_name" className="block text-sm font-medium text-[var(--color-foreground)]">
                表示名
              </label>
              <input
                type="text"
                name="display_name"
                id="display_name"
                defaultValue={profile.displayName}
                placeholder="プレイヤー名を入力"
                className="block w-full rounded-md border-[var(--color-header-border)] bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                required
                maxLength={50}
              />
              <p className="text-xs text-[var(--color-foreground)] opacity-60">
                スコア管理やレート対象曲画像で表示される名前です。
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                保存
              </button>
            </div>
          </form>
        </div>

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


