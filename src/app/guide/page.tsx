import { BookOpen, Upload, ImageIcon, Calculator, TrendingUp, Settings, HelpCircle } from "lucide-react";

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
              <li>ベスト枠画像を生成してSNSで共有</li>
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
            ベスト枠画像生成
          </h2>
          <div className="space-y-3 text-sm opacity-80">
            <p>
              ベスト40曲のサマリー画像を生成し、SNS等で共有できます。
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

        {/* Settings */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings size={24} className="text-slate-500" />
            設定
          </h2>
          <div className="space-y-3 text-sm opacity-80">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>テーマ切替</strong>：メニューからライト/ダークテーマを切り替え</li>
              <li><strong>データ削除</strong>：設定ページから全スコアデータを削除可能（アカウントは削除されません）</li>
            </ul>
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center text-xs opacity-50 py-4">
          TAKUMI³ Score Manager — ご不明な点があればお気軽にお問い合わせください
        </div>

      </div>
    </div>
  );
}
