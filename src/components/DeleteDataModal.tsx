'use client';

import { useState } from 'react';
import { deleteUserData } from '@/app/settings/actions';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteDataModal({ isOpen, onClose }: DeleteDataModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUserData();
      // Redirect or refresh is handled by the server action or router ensures clean state
      // But typically we might want to redirect if the session is invalidated, 
      // though here we keep the clerk account so we just refresh.
      // However, usually after deleting all date, a redirect to dashboard (now empty) is good.
      router.push('/dashboard');
      router.refresh(); 
      onClose();
    } catch (error) {
      console.error('Failed to delete data:', error);
      alert('データの削除に失敗しました。');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[var(--color-card-bg)] border border-red-500/30 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center gap-3 text-red-500 border-b border-red-500/20 pb-4">
          <AlertTriangle size={24} />
          <h2 className="text-xl font-bold">
            {step === 1 ? 'データ削除の確認' : '最終確認'}
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {step === 1 ? (
            <>
              <p className="text-[var(--color-foreground)] font-medium">
                この操作を行うと、TAKUMI³ Score Managerに保存されている<span className="text-red-400 font-bold">全てのデータ</span>が削除されます。
              </p>
              <ul className="list-disc list-inside text-sm text-[var(--color-foreground)] opacity-80 space-y-1 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <li>登録した全てのベストスコア</li>
                <li>スコアの更新履歴</li>
                <li>CSVインポートのログ</li>
                <li>ユーザー設定（表示名など）</li>
              </ul>
              <p className="text-sm text-[var(--color-foreground)] opacity-70">
                ※ Clerkアカウント自体は削除されません。次回ログイン時に新規ユーザーとして扱われます。
              </p>
            </>
          ) : (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg text-center space-y-2">
              <p className="text-red-500 font-bold text-lg">本当に削除しますか？</p>
              <p className="text-[var(--color-foreground)] text-sm">
                この操作は取り消すことができません。<br />
                全てのデータが永久に失われます。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-menu-hover)] transition-colors"
          >
            キャンセル
          </button>
          
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
            >
              次へ
            </button>
          ) : (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  削除中...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  完全に削除する
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
