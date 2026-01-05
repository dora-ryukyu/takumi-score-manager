"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertTriangle, Loader2, FileText } from "lucide-react";
import { importScores, ImportResult } from "@/lib/actions/import";

interface ImportFormProps {
  userId: string;
}

export default function ImportForm({ userId }: ImportFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResult(null); // 前回の結果をクリア
    }
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setResult({
        success: false,
        totalRows: 0,
        matchedRows: 0,
        updatedRows: 0,
        warnings: [],
        error: "ファイルを選択してください",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // ファイル内容をテキストとして読み込む
      const csvContent = await file.text();

      // Server Actionを呼び出し
      const importResult = await importScores(userId, csvContent, new Date());
      setResult(importResult);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setResult({
        success: false,
        totalRows: 0,
        matchedRows: 0,
        updatedRows: 0,
        warnings: [],
        error: `エラーが発生しました: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* ファイル選択エリア */}
      <div className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-[var(--color-header-fill)] rounded-full flex items-center justify-center text-[var(--color-header-border)]">
            <Upload size={32} />
          </div>

          <div>
            <h3 className="text-lg font-bold mb-1">CSVファイルをアップロード</h3>
            <p className="text-sm text-[var(--color-foreground)] opacity-70">
              TAKUMI³からエクスポートしたCSVファイルを選択してください
            </p>
          </div>

          {/* ファイル選択 */}
          <div className="w-full max-w-sm">
            <label className="block">
              <span className="sr-only">CSVファイルを選択</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="block w-full text-sm text-[var(--color-foreground)]
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[var(--color-accent)] file:text-white
                  hover:file:opacity-80
                  file:cursor-pointer cursor-pointer
                  file:transition-all"
              />
            </label>
          </div>

          {/* 選択されたファイル名 */}
          {fileName && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-foreground)] opacity-80">
              <FileText size={16} />
              <span>{fileName}</span>
            </div>
          )}

          {/* インポートボタン */}
          <button
            onClick={handleImport}
            disabled={isLoading || !fileName}
            className="px-6 py-3 bg-[var(--color-accent)] text-white font-bold rounded-lg
              hover:opacity-80 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                インポート中...
              </>
            ) : (
              <>
                <Upload size={20} />
                インポート実行
              </>
            )}
          </button>
        </div>
      </div>

      {/* 結果表示 */}
      {result && (
        <div
          className={`rounded-2xl p-6 border ${
            result.success
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                result.success
                  ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
                  : "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300"
              }`}
            >
              {result.success ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            </div>

            <div className="flex-1 space-y-3">
              <h4
                className={`font-bold text-lg ${
                  result.success
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                {result.success ? "インポート完了" : "インポート失敗"}
              </h4>

              {result.success ? (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="text-2xl font-bold text-[var(--color-foreground)]">
                      {result.totalRows}
                    </div>
                    <div className="text-[var(--color-foreground)] opacity-70">CSV行数</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="text-2xl font-bold text-[var(--color-foreground)]">
                      {result.matchedRows}
                    </div>
                    <div className="text-[var(--color-foreground)] opacity-70">マッチ数</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {result.updatedRows}
                    </div>
                    <div className="text-[var(--color-foreground)] opacity-70">更新数</div>
                  </div>
                </div>
              ) : (
                <p className="text-red-700 dark:text-red-300">{result.error}</p>
              )}

              {/* 警告一覧 */}
              {result.warnings.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-yellow-900/20 rounded-lg border border-amber-300 dark:border-yellow-800">
                  <h5 className="font-semibold text-amber-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    警告 ({result.warnings.length}件)
                  </h5>
                  <ul className="text-sm text-amber-800 dark:text-yellow-300 space-y-1 max-h-40 overflow-y-auto">
                    {result.warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 再実行ボタン */}
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 text-sm font-medium border border-current rounded-lg
                  hover:bg-[var(--color-card-bg)] transition-colors"
              >
                別のファイルをインポート
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 使い方ガイド */}
      <div className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
        <h3 className="font-bold mb-3">📋 CSVフォーマット</h3>
        <p className="text-sm text-[var(--color-foreground)] opacity-80 mb-3">
          以下の形式のCSVファイルに対応しています:
        </p>
        <div className="bg-[var(--color-background)] p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <div className="text-[var(--color-foreground)] opacity-60">曲名,難易度,レベル,スコア</div>
          <div>曲名A,MASTER,14,987654</div>
          <div>曲名B,INSANITY,15,965432</div>
        </div>
        <p className="text-xs text-[var(--color-foreground)] opacity-60 mt-3">
          ※ NORMAL / HARD / MASTER / INSANITY などの正式名称で記載してください
        </p>
      </div>
    </div>
  );
}
