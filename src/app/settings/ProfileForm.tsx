'use client';

import { useState, useTransition } from "react";
import Image from "next/image";
import { updateProfile } from "./actions";

interface ProfileFormProps {
  profile: {
    userId: string;
    displayName: string;
    imageUrl: string;
  };
  externalUserId: string | null;
}

export default function ProfileForm({ profile, externalUserId }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateProfile(formData);
        setMessage({ text: "保存しました！", type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ text: "保存に失敗しました", type: 'error' });
      }
    });
  };

  return (
    <div className="bg-[var(--color-card-bg)] p-8 rounded-xl shadow-sm border border-[var(--color-header-border)]">
      <form action={handleSubmit} className="space-y-6">
        {/* User Icon Display (Read-only) */}
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0 aspect-square rounded-full overflow-hidden border border-[var(--color-header-border)] bg-[var(--color-menu-hover)]">
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

        {/* External User ID Input */}
        <div className="space-y-2">
          <label htmlFor="external_user_id" className="block text-sm font-medium text-[var(--color-foreground)]">
            外部ツール ユーザーID
          </label>
          <input
            type="text"
            name="external_user_id"
            id="external_user_id"
            defaultValue={externalUserId ?? ""}
            placeholder="takumi3scoretool のユーザーID"
            className="block w-full rounded-md border-[var(--color-header-border)] bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            maxLength={100}
          />
          <p className="text-xs text-[var(--color-foreground)] opacity-60">
            スコアインポート時に自動入力されます。空欄で保存するとクリアされます。
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className={`w-full sm:w-auto flex justify-center py-2 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
          >
            {isPending ? '保存中...' : '保存'}
          </button>
          
          {message && (
            <div className={`text-sm font-medium ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message.text}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
