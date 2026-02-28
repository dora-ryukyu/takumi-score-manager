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
    id: "2026-03-01-direct-import",
    date: "2026-03-01",
    title: "スコア直接インポート機能の追加",
    content: "外部ツールのユーザーIDを入力するだけで、スコアデータを自動取得・インポートできる機能を追加しました。\n\nこれまではCSVファイルをダウンロードしてからアップロードする必要がありましたが、今後はユーザーIDを入力してボタンを押すだけでインポートが完了します。\n\nまた、設定ページでユーザーIDを保存しておくと、次回以降のインポート時に自動入力されます。\n\n従来のCSVファイルからのインポートも引き続きご利用いただけます。",
    isImportant: true,
  },
  {
    id: "2026-03-01-manual-score",
    date: "2026-03-01",
    title: "手動スコア記録機能の追加・未対応楽曲への対応",
    content: "CSVに記録されていない譜面のスコアを手動で記録できる機能を追加しました。\n\nCSVインポートページに「手動スコア記録」セクションを追加しています。以下の譜面が対象です：\n・竹 [MASTER]\n・竹 [RAVAGE]\n・LAST PROPOZE [INSANITY]\n・Oceanus [INSANITY]\n\nなお、Ardent Gaff については公式CSVへの掲載が確認されたため、CSVインポートにて自動記録されます。",
    isImportant: true,
  },
  {
    id: "2026-03-01-score-zero-restore",
    date: "2026-03-01",
    title: "スコア0の譜面も記録されるようになりました",
    content: "以前はサーバー負荷対策のためスコア0の譜面を記録対象外にしていましたが、ユーザー数の増加が落ち着いたため、スコア0も含めて記録されるようになりました。\n\n次回CSVインポート時より、スコア0の譜面も自動的に記録されます。",
    isImportant: false,
  },
  {
    id: "2026-01-05-score-zero",
    date: "2026-01-05",
    title: "スコア0の譜面の記録について（対応済み）",
    content: "サーバー負荷軽減のため、スコアが0点の譜面は記録されないように変更しました。\nプレイしたことのある譜面のみが記録されます。\n\nこれまでに記録されたデータには影響ありません。\n\n※ 2026-03-01 よりスコア0も記録されるようになりました。",
    isImportant: false,
  },
  {
    id: "2026-01-28-mitaiou",
    date: "2026-01-28",
    title: "未対応楽曲に関するお知らせ（対応済み）",
    content: "現在「TAKUMI³ Score Manager」では、以下の楽曲、譜面に対応しておりません。\n\n・竹\n・LAST PROPOZE [INS]\n・Oceanus [INS]\n理由：公式CSVデータに情報が含まれていないため。\n今後：対応時期は未定です。\n\n対応までは、スコアログの保存やレート対象曲への反映が行われません。ユーザーの皆様にはご不便をおかけしますが、ご了承のほどお願い申し上げます。\n\n※ 2026-03-01 より手動スコア記録機能にて対応しました。",
    isImportant: false,
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
