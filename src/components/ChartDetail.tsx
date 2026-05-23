"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { getDiffColor, getRateColorClass } from "@/lib/colors";
import { calculateRating } from "@/lib/rating"; 
import { useRouter } from "next/navigation";
import { deleteChartScore } from "@/app/dashboard/actions";
import { Trash2 } from "lucide-react";

export type HistoryRow = {
  id: number;
  score: number;
  observed_at: string;
  rank?: string; 
};

export type ChartInfo = {
  chartId: string;
  title: string;
  difficulty: string;
  constValue: number;
  currentBest: number;
};

export default function ChartDetail({
  history,
  info,
}: {
  history: HistoryRow[];
  info: ChartInfo;
}) {
  const [excludeZero, setExcludeZero] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  // Sort history for graph (oldest to newest)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime()
  );

  // Filter data
  const chartData = excludeZero 
    ? sortedHistory.filter(h => h.score > 0)
    : sortedHistory;

  const diffColor = getDiffColor(info.difficulty);
  const rateColorClass = getRateColorClass(
    calculateRating(info.currentBest, info.constValue)
  );

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[var(--color-card-bg)] rounded-xl p-6 shadow-lg border border-[var(--color-header-border)] transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span 
                        className="px-2 py-0.5 rounded text-white text-sm font-bold shadow-sm"
                        style={{ backgroundColor: diffColor }}
                    >
                        {info.difficulty}
                    </span>
                    <span className="text-[var(--color-foreground)] opacity-70 text-sm font-mono">
                        定数: {info.constValue.toFixed(1)}
                    </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] tracking-tight">
                    {info.title}
                </h1>
            </div>
            
            <div className="flex flex-col md:items-end items-stretch w-full md:w-auto gap-3">
                <div className="text-center md:text-right">
                    <div className="text-sm text-[var(--color-foreground)] opacity-70 mb-1">スコア</div>
                    <div className="text-4xl font-mono font-bold text-[var(--color-foreground)]">
                        {info.currentBest.toLocaleString()}
                    </div>
                    <div className="text-xl mt-1">
                        <span className={rateColorClass}>
                            単曲レート: {calculateRating(info.currentBest, info.constValue).toFixed(3)}
                        </span>
                    </div>
                </div>

                <div className="flex md:justify-end justify-center pt-2 border-t border-[var(--color-header-border)] md:border-0">
                  {showConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-500 font-semibold">本当に全スコア履歴を削除しますか？</span>
                      <button
                        onClick={async () => {
                          setIsDeleting(true);
                          try {
                            const res = await deleteChartScore(info.chartId);
                            if (res.success) {
                              router.push("/dashboard");
                              router.refresh();
                            } else {
                              alert(res.message);
                              setIsDeleting(false);
                              setShowConfirm(false);
                            }
                          } catch {
                            alert("エラーが発生しました。");
                            setIsDeleting(false);
                            setShowConfirm(false);
                          }
                        }}
                        disabled={isDeleting}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? "削除中..." : "削除する"}
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        disabled={isDeleting}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-1.5 rounded border border-red-500/30 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                      この譜面の全スコアデータを削除
                    </button>
                  )}
                </div>
            </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[var(--color-card-bg)] rounded-xl p-6 shadow-lg border border-[var(--color-header-border)] transition-colors">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[var(--color-foreground)]">スコア推移</h2>
            
            {/* Toggle 0 exclusion */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={excludeZero}
                    onChange={(e) => setExcludeZero(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-[var(--color-foreground)]">0点を除外</span>
            </label>
        </div>

        <div className="h-[250px] sm:h-[300px] w-full">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-header-border)" opacity={0.3} />
                        <XAxis 
                            dataKey="observed_at" 
                            tickFormatter={formatDate}
                            stroke="var(--color-foreground)"
                            tick={{ fontSize: 12, fill: "var(--color-foreground)", opacity: 0.7 }}
                            minTickGap={30}
                        />
                        <YAxis 
                            domain={['auto', 'auto']} 
                            stroke="var(--color-foreground)"
                            width={55}
                            tickFormatter={(val) => val.toLocaleString()}
                            tick={{ fontSize: 10, fill: "var(--color-foreground)", opacity: 0.7 }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: "var(--color-card-bg)", 
                                borderColor: "var(--color-header-border)", 
                                color: "var(--color-foreground)" 
                            }}
                            labelFormatter={formatDate}
                            formatter={(value: number | undefined) => [value?.toLocaleString() ?? "0", "スコア"]}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="var(--color-accent)" 
                            strokeWidth={3}
                            activeDot={{ r: 6 }}
                            dot={{ r: 3, fill: "var(--color-accent)" }} 
                            animationDuration={500}
                        />
                        <Brush 
                            dataKey="observed_at" 
                            height={25} 
                            stroke="var(--color-accent)"
                            fill="var(--color-card-bg)"
                            tickFormatter={() => ""}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-[var(--color-foreground)] opacity-50">
                    表示できる履歴データがありません
                </div>
            )}
        </div>
      </div>

      {/* History List */}
      <div className="bg-[var(--color-card-bg)] rounded-xl p-6 shadow-lg border border-[var(--color-header-border)] overflow-hidden transition-colors">
        <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-4">更新履歴</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--color-foreground)]">
                <thead className="text-xs uppercase bg-[var(--color-menu-hover)] text-[var(--color-foreground)] opacity-70 border-b border-[var(--color-header-border)]">
                    <tr>
                        <th className="px-4 py-3">日時</th>
                        <th className="px-4 py-3">スコア</th>
                        <th className="px-4 py-3">更新幅</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-header-border)]">
                    {[...history].sort(
                            (a, b) => new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime()
                        ).map((row, i, arr) => {
                        const prev = arr[i + 1];
                        const diff = prev ? row.score - prev.score : 0;
                        
                        return (
                            <tr key={row.id} className="hover:bg-[var(--color-menu-hover)] transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap opacity-90">
                                    {new Date(row.observed_at).toLocaleString("ja-JP")}
                                </td>
                                <td className="px-4 py-3 font-mono font-bold">
                                    {row.score.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 font-mono">
                                    {diff > 0 ? (
                                        <span className="text-green-500">+{diff.toLocaleString()}</span>
                                    ) : diff < 0 ? (
                                        <span className="text-red-500">{diff.toLocaleString()}</span>
                                    ) : (
                                        <span className="opacity-50">-</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
