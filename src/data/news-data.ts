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
    id: "2026-01-05-score-zero",
    date: "2026-01-05",
    title: "スコア0の譜面の記録について",
    content: "サーバー負荷軽減のため、スコアが0点の譜面は記録されないように変更しました。\nプレイしたことのある譜面のみが記録されます。\n\nこれまでに記録されたデータには影響ありません。",
    isImportant: true,
  },
  {
    id: "2026-01-28-mitaiou",
    date: "2026-01-28",
    title: "未対応楽曲に関するお知らせ",
    content: "現在「TAKUMI³ Score Manager」では、以下の楽曲、譜面に対応しておりません。\n\n・竹\n・LAST PROPOZE [INS]\n・Oceanus [INS]\n理由：公式CSVデータに情報が含まれていないため。\n今後：対応時期は未定です。\n\n対応までは、スコアログの保存やレート対象曲への反映が行われません。ユーザーの皆様にはご不便をおかけしますが、ご了承のほどお願い申し上げます。",
    isImportant: true,
  },
  {
    id: "2026-01-01-release",
    date: "2026-01-01",
    title: "サービス公開のお知らせ",
    content: "TAKUMI³ Score Managerを公開しました。ご利用いただきありがとうございます。\n機能に関するご質問やご要望がありましたら、お気軽にお問い合わせください。",
    isImportant: false,
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
