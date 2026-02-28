"use client";

import { useState, useRef } from "react";
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  PenLine,
  Search,
  ChevronDown,
} from "lucide-react";
import { importScores, ImportResult } from "@/lib/actions/import";
import {
  ManualChart,
  ManualScoreResult,
  submitManualScore,
} from "@/lib/actions/manual-score";

interface ImportFormProps {
  userId: string;
  manualCharts: ManualChart[];
}

// 難易度の表示色（CSS変数小参照でテーマ対応）
const DIFFICULTY_COLORS: Record<string, string> = {
  NORMAL: "text-[var(--diff-text-normal)]",
  HARD: "text-[var(--diff-text-hard)]",
  MASTER: "text-[var(--diff-text-master)]",
  INSANITY: "text-[var(--diff-text-insanity)]",
  RAVAGE: "text-[var(--diff-text-ravage)]",
};

export default function ImportForm({ userId, manualCharts }: ImportFormProps) {
  // --- CSV Import State ---
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Manual Score State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChart, setSelectedChart] = useState<ManualChart | null>(null);
  const [manualScore, setManualScore] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState<ManualScoreResult | null>(null);

  // --- CSV Import Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResult(null);
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
      const csvContent = await file.text();
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

  // --- Manual Score Handlers ---
  const filteredCharts = manualCharts.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChart = (chart: ManualChart) => {
    setSelectedChart(chart);
    setSearchQuery(`${chart.title} [${chart.difficulty}]`);
    setIsDropdownOpen(false);
    setManualResult(null);
  };

  const handleManualSubmit = async () => {
    if (!selectedChart) return;
    const score = parseInt(manualScore, 10);
    if (isNaN(score) || score < 0 || score > 1010000) {
      setManualResult({
        success: false,
        message: "スコアは 0〜1,010,000 の整数で入力してください。",
      });
      return;
    }

    setManualLoading(true);
    setManualResult(null);
    try {
      const res = await submitManualScore(userId, selectedChart.chart_id, score);
      setManualResult(res);
      if (res.success) {
        setManualScore("");
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setManualResult({ success: false, message: `エラー: ${errorMessage}` });
    } finally {
      setManualLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedChart(null);
    setIsDropdownOpen(true);
    setManualResult(null);
  };

  return (
    <div className="space-y-8">
      {/* ===== CSV インポートセクション ===== */}
      <section className="space-y-6">
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

            {fileName && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-foreground)] opacity-80">
                <FileText size={16} />
                <span>{fileName}</span>
              </div>
            )}

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

        {/* CSV 結果表示 */}
        {result && (
          <div
            className={`rounded-2xl p-6 border ${
              result.success
                ? "bg-[var(--alert-success-bg)] border-[var(--alert-success-border)]"
                : "bg-[var(--alert-error-bg)] border-[var(--alert-error-border)]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  result.success
                    ? "bg-[var(--alert-success-bg)] text-[var(--alert-success-text)]"
                    : "bg-[var(--alert-error-bg)] text-[var(--alert-error-text)]"
                }`}
              >
                {result.success ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
              </div>

              <div className="flex-1 space-y-3">
                <h4
                  className={`font-bold text-lg ${
                    result.success
                      ? "text-[var(--alert-success-text)]"
                      : "text-[var(--alert-error-text)]"
                  }`}
                >
                  {result.success ? "インポート完了" : "インポート失敗"}
                </h4>

                {result.success ? (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-header-border)]">
                      <div className="text-2xl font-bold text-[var(--color-foreground)]">
                        {result.totalRows}
                      </div>
                      <div className="text-[var(--color-foreground)] opacity-70">CSV行数</div>
                    </div>
                    <div className="text-center p-3 bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-header-border)]">
                      <div className="text-2xl font-bold text-[var(--color-foreground)]">
                        {result.matchedRows}
                      </div>
                      <div className="text-[var(--color-foreground)] opacity-70">マッチ数</div>
                    </div>
                    <div className="text-center p-3 bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-header-border)]">
                      <div className="text-2xl font-bold text-[var(--alert-success-text)]">
                        {result.updatedRows}
                      </div>
                      <div className="text-[var(--color-foreground)] opacity-70">更新数</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[var(--alert-error-text)]">{result.error}</p>
                )}

                {result.warnings.length > 0 && (
                  <div className="mt-4 p-4 bg-[var(--alert-warn-bg)] rounded-lg border border-[var(--alert-warn-border)]">
                    <h5 className="font-semibold text-[var(--alert-warn-title)] mb-2 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      警告（{result.warnings.length}件）
                    </h5>
                    <ul className="text-sm text-[var(--alert-warn-text)] space-y-1 max-h-40 overflow-y-auto">
                      {result.warnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

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

        {/* CSVフォーマット説明 */}
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
      </section>

      {/* ===== 手動スコア記録セクション ===== */}
      {manualCharts.length > 0 && (
        <section className="space-y-4">
          {/* セクションヘッダー */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-header-border)]" />
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)] opacity-60 px-2">
              <PenLine size={14} />
              手動スコア記録
            </div>
            <div className="h-px flex-1 bg-[var(--color-header-border)]" />
          </div>

          <div className="bg-[var(--color-card-bg)] rounded-2xl p-6 border border-[var(--color-header-border)]">
            {/* 説明文 */}
            <div className="flex items-start gap-3 p-4 bg-[var(--alert-warn-bg)] rounded-xl border border-[var(--alert-warn-border)] mb-6">
              <AlertTriangle size={18} className="text-[var(--alert-warn-title)] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[var(--alert-warn-text)] space-y-1">
                <p className="font-semibold">CSVに記録されていない譜面があります</p>
                <p className="opacity-80">
                  以下の譜面は公式CSVに含まれていないため、CSVインポートでは自動登録されません。
                  スコアをお持ちの場合は手動で記録してください。
                </p>
                <ul className="mt-2 space-y-0.5 opacity-80">
                  {manualCharts.map((c) => (
                    <li key={c.chart_id} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <span>
                        {c.title}{" "}
                        <span className={`font-mono text-xs ${DIFFICULTY_COLORS[c.difficulty] ?? ""}`}>
                          [{c.difficulty}]
                        </span>{" "}
                        <span className="opacity-60">— Const {c.const_value.toFixed(1)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 譜面選択 + スコア入力 */}
            <div className="space-y-4">
              {/* 譜面検索 */}
              <div className="relative">
                <label className="block text-sm font-semibold mb-2">
                  譜面を選択
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground)] opacity-40 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="曲名または難易度で検索..."
                    className="w-full pl-9 pr-10 py-3 rounded-xl border border-[var(--color-header-border)]
                      bg-[var(--color-background)] text-[var(--color-foreground)]
                      focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]
                      placeholder:opacity-40 text-sm"
                  />
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground)] opacity-40"
                  />
                </div>

                {/* ドロップダウン */}
                {isDropdownOpen && filteredCharts.length > 0 && !selectedChart && (
                  <div
                    className="absolute z-10 w-full mt-1 bg-[var(--color-card-bg)] border border-[var(--color-header-border)]
                      rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
                  >
                    {filteredCharts.map((chart) => (
                      <button
                        key={chart.chart_id}
                        onMouseDown={() => handleSelectChart(chart)}
                        className="w-full text-left px-4 py-3 hover:bg-[var(--color-header-fill)]
                          transition-colors flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="font-medium">{chart.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-mono ${DIFFICULTY_COLORS[chart.difficulty] ?? ""}`}>
                            {chart.difficulty}
                          </span>
                          <span className="text-xs opacity-50">
                            {chart.const_value.toFixed(1)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* スコア入力 */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  スコア入力
                </label>
                <input
                  type="number"
                  value={manualScore}
                  onChange={(e) => {
                    setManualScore(e.target.value);
                    setManualResult(null);
                  }}
                  placeholder="0 〜 1,010,000"
                  min={0}
                  max={1010000}
                  disabled={!selectedChart}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-header-border)]
                    bg-[var(--color-background)] text-[var(--color-foreground)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]
                    placeholder:opacity-40 text-sm
                    disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              {/* 送信ボタン */}
              <button
                onClick={handleManualSubmit}
                disabled={!selectedChart || !manualScore || manualLoading}
                className="w-full px-6 py-3 bg-[var(--color-accent)] text-white font-bold rounded-xl
                  hover:opacity-80 transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {manualLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    記録中...
                  </>
                ) : (
                  <>
                    <PenLine size={18} />
                    スコアを記録する
                  </>
                )}
              </button>

              {/* 手動記録結果 */}
              {manualResult && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-xl border ${
                    manualResult.success
                      ? "bg-[var(--alert-success-bg)] border-[var(--alert-success-border)]"
                      : "bg-[var(--alert-error-bg)] border-[var(--alert-error-border)]"
                  }`}
                >
                  {manualResult.success ? (
                    <CheckCircle size={18} className="text-[var(--alert-success-text)] mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle size={18} className="text-[var(--alert-error-text)] mt-0.5 flex-shrink-0" />
                  )}
                  <p
                    className={`text-sm font-medium ${
                      manualResult.success
                        ? "text-[var(--alert-success-text)]"
                        : "text-[var(--alert-error-text)]"
                    }`}
                  >
                    {manualResult.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
