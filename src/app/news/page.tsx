"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { NEWS_DATA, NewsItem } from "@/data/news-data";
import { CONTACT_INFO } from "@/data/contact";

export default function NewsPage() {
  const [showAllGeneral, setShowAllGeneral] = useState(false);

  // 重要なお知らせと一般のお知らせを分離
  const importantNews = NEWS_DATA.filter(item => item.isImportant);
  const generalNews = NEWS_DATA.filter(item => !item.isImportant);
  
  // 一般のお知らせは最新3件、または全件表示
  const INITIAL_GENERAL_COUNT = 3;
  const displayedGeneralNews = showAllGeneral 
    ? generalNews 
    : generalNews.slice(0, INITIAL_GENERAL_COUNT);
  const hasMoreGeneralNews = generalNews.length > INITIAL_GENERAL_COUNT;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header - アイコンなし（他ページと一貫性を保つ） */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">お知らせ</h1>
          <p className="opacity-70 mt-1">TAKUMI³ Score Managerの更新情報・お知らせ</p>
        </header>

        {/* 重要なお知らせ（常に全て表示） */}
        {importantNews.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-red-500">
              <AlertTriangle size={20} />
              重要なお知らせ
            </h2>
            <div className="space-y-4">
              {importantNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* 一般のお知らせ（最新3件 + 折りたたみ） */}
        {generalNews.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold">お知らせ</h2>
            <div className="space-y-4">
              {displayedGeneralNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>

            {/* もっと見る / 折りたたむボタン */}
            {hasMoreGeneralNews && (
              <button
                onClick={() => setShowAllGeneral(!showAllGeneral)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-card-bg)] border border-[var(--color-header-border)] rounded-xl text-sm font-medium hover:bg-[var(--color-menu-hover)] transition-colors"
              >
                {showAllGeneral ? (
                  <>
                    <ChevronUp size={16} />
                    折りたたむ
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    過去のお知らせを表示（{generalNews.length - INITIAL_GENERAL_COUNT}件）
                  </>
                )}
              </button>
            )}
          </section>
        )}

        {/* お知らせがない場合 */}
        {NEWS_DATA.length === 0 && (
          <div className="bg-[var(--color-card-bg)] rounded-2xl p-8 border border-[var(--color-header-border)] text-center">
            <p className="opacity-60">現在お知らせはありません</p>
          </div>
        )}

        {/* お問い合わせセクション（独立したセクションとして明確に配置） */}
        <section className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
          <h2 className="text-lg font-bold mb-4">お問い合わせ</h2>
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
              {CONTACT_INFO.googleForm && (
                <a
                  href={CONTACT_INFO.googleForm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  お問い合わせフォーム
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ページ下部のリンクは削除（メニューから辿ればよい） */}

      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <div className={`bg-[var(--color-card-bg)] rounded-2xl p-6 border ${
      item.isImportant 
        ? "border-red-500/50 shadow-lg shadow-red-500/10" 
        : "border-[var(--color-header-border)]"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {item.isImportant && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
              <AlertTriangle size={12} />
              重要
            </span>
          )}
          <span className="text-xs text-[var(--color-foreground)] opacity-60">
            {formatDate(item.date)}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold mb-2">{item.title}</h3>

      {/* Content */}
      <div className="text-sm opacity-80 whitespace-pre-line">
        {item.content}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
