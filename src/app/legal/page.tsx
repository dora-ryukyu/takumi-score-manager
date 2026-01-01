import { FileText, Database, BarChart3, Trash2, Mail } from "lucide-react";
import Link from "next/link";
import { CONTACT_INFO } from "@/data/contact";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">
            プライバシーポリシー・利用規約
          </h1>
          <p className="opacity-70 mt-1">最終更新日: 2026年1月1日</p>
        </header>

        {/* Introduction */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <p className="opacity-80">
            本ページでは、TAKUMI³ Score Manager（以下「本サービス」）のプライバシーポリシーおよび利用規約について説明します。
            本サービスをご利用いただく前に、必ずお読みください。
          </p>
        </section>

        {/* Privacy Policy */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)] space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="text-blue-500" />
            プライバシーポリシー
          </h2>

          {/* Data Collection */}
          <div className="space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <Database size={18} className="text-green-500" />
              収集するデータ
            </h3>
            <div className="text-sm opacity-80 space-y-2 ml-6">
              <p>本サービスでは、以下の情報を収集・保存します：</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>認証情報</strong>：Clerk認証を通じて取得するユーザーID、表示名、プロフィール画像URL</li>
                <li><strong>スコアデータ</strong>：CSVインポートまたは手動で登録されたゲームスコア情報</li>
                <li><strong>スコア履歴</strong>：スコアの更新履歴（最大100件/譜面）</li>
                <li><strong>ユーザー設定</strong>：表示名などのカスタマイズ情報</li>
              </ul>
            </div>
          </div>

          {/* Data Storage */}
          <div className="space-y-3">
            <h3 className="font-bold">データの保管場所</h3>
            <div className="text-sm opacity-80 ml-6">
              <p>
                データはCloudflare D1データベースに保存されます。
                Cloudflareのセキュリティ基準に基づいて保護されています。
              </p>
            </div>
          </div>

          {/* Data Access Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              ⚠️ 運営者によるデータアクセスについて
            </h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                本サービスの運営者は、サービスの保守・運営・不具合調査のため、
                データベースに保存されたデータを閲覧できる立場にあります。
              </p>
              <p className="mt-2">
                ただし、個人を特定する目的での閲覧や、第三者への提供は行いません。
              </p>
            </div>
          </div>

          {/* Future Statistics */}
          <div className="space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-500" />
              将来的な統計機能について
            </h3>
            <div className="text-sm opacity-80 ml-6">
              <p>
                将来的に、以下のような匿名統計機能を追加する可能性があります：
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>楽曲別の平均スコア・S達成率</li>
                <li>難易度別のスコア分布</li>
                <li>全体的なプレイ傾向の可視化</li>
              </ul>
              <p className="mt-2">
                これらの統計情報は個人を特定できない形で集計・公開されます。
                統計機能を追加する際は、お知らせページでお知らせします。
              </p>
            </div>
          </div>

          {/* Data Deletion */}
          <div className="space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <Trash2 size={18} className="text-red-500" />
              データの削除
            </h3>
            <div className="text-sm opacity-80 ml-6">
              <p>
                ユーザーは設定ページからいつでも自分のスコアデータを完全に削除できます。
                削除されたデータは復元できません。
              </p>
              <p className="mt-2">
                なお、Clerkアカウント自体の削除は本サービスでは対応しておりません。
                アカウント削除をご希望の場合は、Clerkのアカウント設定から行ってください。
              </p>
            </div>
          </div>
        </section>

        {/* Terms of Service */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)] space-y-6">
          <h2 className="text-xl font-bold">利用規約</h2>

          <div className="text-sm opacity-80 space-y-4">
            <div>
              <h3 className="font-bold mb-2">1. サービスの提供</h3>
              <p>
                本サービスは個人が運営する非公式ツールです。
                予告なくサービスを変更・停止する場合があります。
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">2. 禁止事項</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>他者になりすましての利用</li>
                <li>サービスへの過度な負荷をかける行為</li>
                <li>不正なデータの送信</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-2">3. 免責事項</h3>
              <p>
                本サービスは「現状のまま」提供されます。
                データの損失、サービスの中断などによる損害について、運営者は責任を負いません。
                重要なデータは定期的にバックアップを取ることを推奨します。
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">4. 知的財産権</h3>
              <p>
                「TAKUMI³」は株式会社タイトーの登録商標です。
                本サービスは非公式のファンメイドツールであり、タイトー社とは一切関係ありません。
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">5. 規約の変更</h3>
              <p>
                本規約は予告なく変更される場合があります。
                重要な変更がある場合は、お知らせページでお知らせします。
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Mail className="text-cyan-500" />
            お問い合わせ
          </h2>
          <div className="text-sm opacity-80 space-y-3">
            <p>
              本ポリシー・規約に関するご質問がありましたら、以下の方法でお問い合わせください。
            </p>
            <div className="flex flex-wrap gap-3">
              {CONTACT_INFO.discord && (
                <a
                  href={CONTACT_INFO.discord.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  {CONTACT_INFO.discord.displayText}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Back Links */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Link 
            href="/news" 
            className="text-[var(--color-accent)] hover:underline"
          >
            ← お知らせに戻る
          </Link>
          <Link 
            href="/" 
            className="text-[var(--color-accent)] hover:underline"
          >
            トップページへ
          </Link>
        </div>

      </div>
    </div>
  );
}
