import { BookOpen, Upload, ImageIcon, Calculator, TrendingUp, Settings, HelpCircle, Mail, Bell } from "lucide-react";
import { CONTACT_INFO } from "@/data/contact";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">使い方ガイド</h1>
          <p className="opacity-70 mt-1">TAKUMI³ Score Managerの機能と使い方を説明します</p>
        </header>

        {/* Quick Start */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <HelpCircle size={24} className="text-[var(--color-accent)]" />
            はじめに
          </h2>
          <p className="opacity-80 mb-4">
            TAKUMI³ Score Managerは、音楽ゲーム「TAKUMI³」のスコアを管理し、レートを計算するためのツールです。
          </p>
          <div className="bg-[var(--color-menu-hover)] rounded-xl p-4">
            <h3 className="font-bold mb-2">📌 基本的な流れ</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm opacity-80">
              <li>CSVインポートでスコアデータを読み込む</li>
              <li>スコア一覧でベストスコアを確認</li>
              <li>レート対象曲画像を生成してSNSで共有</li>
            </ol>
          </div>
        </section>

        {/* Score List */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen size={24} className="text-blue-500" />
            スコア一覧
          </h2>
          <div className="space-y-3 text-sm opacity-80">
            <p>
              登録されているすべてのスコアを一覧で確認できます。
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>並び替え</strong>：ヘッダーをクリック（PCの場合）またはドロップダウン（スマホの場合）で並び替え</li>
              <li><strong>絞り込み</strong>：難易度、譜面定数、スコア、単曲レートで絞り込み可能</li>
              <li><strong>曲名タップ</strong>：スコア推移ページに移動し、過去のスコア履歴を確認</li>
            </ul>
            <div className="bg-[var(--color-menu-hover)] rounded-lg p-3 mt-3">
              <p className="text-xs">
                💡 総合レートはベスト40曲の単曲レート合計で計算されます
              </p>
            </div>
          </div>
        </section>

        {/* CSV Import */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload size={24} className="text-green-500" />
            CSVインポート
          </h2>
          <div className="space-y-3 text-sm opacity-80">
            <p>
              TAKUMI³からエクスポートしたCSVファイルを読み込んで、スコアを一括登録できます。
            </p>
            <div className="bg-[var(--color-background)] p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <div className="opacity-60">曲名,難易度,レベル,スコア</div>
              <div>Example Song,MASTER,14,987654</div>
              <div>Another Song,INSANITY,15,965432</div>
            </div>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-3">
              <li>難易度は正式名称（NORMAL, HARD, MASTER, INSANITY, RAVAGE）で記載</li>
              <li>既存より高いスコアのみ更新されます（ベストスコア管理）</li>
              <li>マッチしなかった曲は警告として表示されます</li>
            </ul>
          </div>
        </section>

        {/* Best Image Generation */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ImageIcon size={24} className="text-purple-500" />
            レート対象曲画像生成
          </h2>
          <div className="space-y-3 text-sm opacity-80">
            <p>
              レート対象となるベスト40曲の画像を生成し、SNS等で共有できます。
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>ゲーム風のデザインで画像を生成</li>
              <li>ユーザー名、総合レート、各曲のスコア・レート値を表示</li>
              <li>生成処理は端末上で行われ、サーバーに画像は保存されません</li>
            </ul>
          </div>
        </section>

        {/* Calculator */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calculator size={24} className="text-orange-500" />
            計算機
          </h2>
          <div className="space-y-3 text-sm opacity-80">
            <p>
              譜面定数とスコアから単曲レートを計算したり、目標レートに必要なスコアを逆算できます。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-[var(--color-menu-hover)] rounded-lg p-3">
                <h4 className="font-bold text-sm mb-1">スコア → レート</h4>
                <p className="text-xs opacity-70">譜面定数とスコアを入力すると、獲得できる単曲レートを計算</p>
              </div>
              <div className="bg-[var(--color-menu-hover)] rounded-lg p-3">
                <h4 className="font-bold text-sm mb-1">レート → スコア</h4>
                <p className="text-xs opacity-70">目標の単曲レートを達成するために必要なスコアを計算</p>
              </div>
            </div>
          </div>
        </section>

        {/* Score History */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-cyan-500" />
            スコア推移
          </h2>
          <div className="space-y-3 text-sm opacity-80">
            <p>
              スコア一覧から曲名をタップすると、その曲のスコア推移ページに移動できます。
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>過去のスコア履歴をグラフで表示</li>
              <li>スコアの伸びを視覚的に確認</li>
              <li>各記録の日時も確認可能</li>
            </ul>
          </div>
        </section>

        {/* News */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell size={24} className="text-yellow-500" />
            お知らせ
          </h2>
          <div className="space-y-3 text-sm opacity-80">
            <p>
              TAKUMI³ Score Managerの更新情報やメンテナンス情報は「お知らせ」ページで確認できます。
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>重要なお知らせ</strong>：不具合情報や重要な変更点などを掲載</li>
              <li><strong>アップデート情報</strong>：新機能の追加や改善内容を掲載</li>
            </ul>
          </div>
        </section>

        {/* Settings */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings size={24} className="text-slate-500" />
            設定
          </h2>
          <div className="space-y-3 text-sm opacity-80">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>プロフィール設定</strong>：設定ページからプレイヤー名（表示名）を変更できます</li>
              <li><strong>テーマ切替</strong>：メニューからライト/ダークテーマを切り替え</li>
              <li><strong>データ削除</strong>：設定ページから全スコアデータを削除可能（アカウントは削除されません）</li>
            </ul>
          </div>
        </section>

        {/* Contact & Links */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail size={24} className="text-cyan-500" />
            お問い合わせ
          </h2>
          <div className="space-y-3 text-sm opacity-80">
            <p>
              機能に関するご質問、バグ報告、ご要望などがありましたらお気軽にお問い合わせください。
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
              {CONTACT_INFO.x && (
                <a
                  href={CONTACT_INFO.x.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  {CONTACT_INFO.x.displayText}
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
