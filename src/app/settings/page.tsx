import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth";
import { updateProfile } from "./actions";
import Image from "next/image";

export default async function SettingsPage() {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 sm:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">設定</h1>
          <p className="text-slate-500 mt-1">
            プロフィールなどの設定を変更します。
          </p>
        </header>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <form action={updateProfile} className="space-y-6">
            
            {/* User Icon Display (Read-only) */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                <Image 
                  src={profile.imageUrl} 
                  alt={profile.displayName} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="text-sm text-slate-500">
                <p>アイコンはClerkアカウント（またはGoogleアカウント）のものが使用されます。</p>
              </div>
            </div>

            {/* Display Name Input */}
            <div className="space-y-2">
              <label htmlFor="display_name" className="block text-sm font-medium text-slate-700">
                表示名
              </label>
              <input
                type="text"
                name="display_name"
                id="display_name"
                defaultValue={profile.displayName}
                placeholder="プレイヤー名を入力"
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                required
                maxLength={50}
              />
              <p className="text-xs text-slate-500">
                ダッシュボードやランキングで表示される名前です。
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
      </div>
    </div>
  );
}
