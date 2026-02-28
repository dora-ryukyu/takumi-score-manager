"use server";

import { importScores, ImportResult } from "./import";

/**
 * 外部CSVツールからスコアを直接インポートするための結果型
 */
export interface DirectImportResult extends ImportResult {
  /** フェッチ段階でのエラー（CSVの取得自体に失敗した場合） */
  fetchError?: string;
}

/**
 * takumi3scoretool から CSV を直接取得してインポートする
 *
 * @param appUserId     アプリケーション内部のユーザーID (Clerk userId)
 * @param externalUserId 外部ツール (takumi3scoretool) のユーザーID
 * @returns インポート結果
 */
export async function fetchAndImportScores(
  appUserId: string,
  externalUserId: string
): Promise<DirectImportResult> {
  // --- 1. 入力バリデーション ---
  const trimmedId = externalUserId.trim();

  if (!trimmedId) {
    return {
      success: false,
      totalRows: 0,
      matchedRows: 0,
      updatedRows: 0,
      warnings: [],
      error: "ユーザーIDを入力してください。",
    };
  }

  // ユーザーIDの長さ制限（攻撃防止）
  if (trimmedId.length > 100) {
    return {
      success: false,
      totalRows: 0,
      matchedRows: 0,
      updatedRows: 0,
      warnings: [],
      error: "ユーザーIDが長すぎます。",
    };
  }

  // --- 2. 外部サーバーからCSVを取得 ---
  const EXTERNAL_URL = "https://takumi3scoretool.straycubic.com/CsvExport.php";

  let csvContent: string;

  try {
    const response = await fetch(EXTERNAL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ user_id: trimmedId }).toString(),
      // 10秒タイムアウト（外部サーバーの応答を待ちすぎない）
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return {
        success: false,
        totalRows: 0,
        matchedRows: 0,
        updatedRows: 0,
        warnings: [],
        error: `外部サーバーからのレスポンスエラー（HTTP ${response.status}）`,
        fetchError: `HTTP ${response.status}`,
      };
    }

    csvContent = await response.text();
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("fetchAndImportScores fetch error:", e);

    // タイムアウトエラーの判定
    if (e instanceof DOMException && e.name === "TimeoutError") {
      return {
        success: false,
        totalRows: 0,
        matchedRows: 0,
        updatedRows: 0,
        warnings: [],
        error: "外部サーバーへの接続がタイムアウトしました。しばらく後に再試行してください。",
        fetchError: "timeout",
      };
    }

    return {
      success: false,
      totalRows: 0,
      matchedRows: 0,
      updatedRows: 0,
      warnings: [],
      error: process.env.NODE_ENV === "development"
        ? `外部サーバーへの接続に失敗しました: ${errorMessage}`
        : "外部サーバーへの接続に失敗しました。しばらく後に再試行してください。",
      fetchError: errorMessage,
    };
  }

  // --- 3. 空レスポンスのチェック ---
  if (!csvContent || csvContent.trim().length === 0) {
    return {
      success: false,
      totalRows: 0,
      matchedRows: 0,
      updatedRows: 0,
      warnings: [],
      error: "CSVデータが取得できませんでした。ユーザーIDが正しいか確認してください。",
    };
  }

  // --- 4. 既存のimportScoresに委譲してインポート ---
  const result = await importScores(appUserId, csvContent, new Date());

  return result;
}
