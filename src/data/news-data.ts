/**
 * お知らせデータ
 * 
 * 新しいお知らせを追加するには、NEWS_DATA配列の先頭に新しいオブジェクトを追加してください。
 * isImportant: true を設定すると「重要」タグが表示されます。
 */

export interface NewsItem {
  id: string;           // ユニークID (例: "2026-01-01-release")
  date: string;         // 日付 (YYYY-MM-DD形式)
  title: string;        // タイトル
  content: string;      // 内容（HTMLタグは使用不可、改行は\nで）
  isImportant?: boolean; // 重要フラグ（trueの場合「重要」タグが表示される）
}

// 新しいお知らせは配列の先頭に追加してください
export const NEWS_DATA: NewsItem[] = [
  {
    id: "2026-01-01-release",
    date: "2026-01-01",
    title: "サービス公開のお知らせ",
    content: "TAKUMI³ Score Managerを正式公開しました。ご利用いただきありがとうございます。\n\n機能に関するご質問やご要望がありましたら、お気軽にお問い合わせください。",
    isImportant: true,
  },
  // ↓ 以下に過去のお知らせを追加していきます
  // {
  //   id: "2026-01-15-update",
  //   date: "2026-01-15",
  //   title: "機能追加のお知らせ",
  //   content: "新機能を追加しました。",
  //   isImportant: false,
  // },
];
