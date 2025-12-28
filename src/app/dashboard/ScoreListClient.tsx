'use client';

import { useState, useMemo } from 'react';
import { getRank } from "@/lib/rank";
import { getRateColorClass } from "@/lib/colors";
import { calculateSongContrib, calculateDisplayRate } from "@/lib/rating";

interface ScoreRow {
  chart_id: string;
  best_score: number;
  const_value: number | null;
  title: string | null;
  difficulty: string | null;
  updated_at: string;
}

interface ScoreListClientProps {
  initialScores: ScoreRow[];
  userName: string | null | undefined;
  userImage: string;
}

type SortColumn = 'chart_id' | 'best_score' | 'rating' | 'updated_at' | 'const_value' | 'title';
type SortDirection = 'asc' | 'desc';

export default function ScoreListClient({ initialScores, userName, userImage }: ScoreListClientProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('rating');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Enriched Data (Calculate Rating once)
  const enrichedScores = useMemo(() => {
    return initialScores.map(row => {
      const constVal = row.const_value ?? 0;
      const contrib = calculateSongContrib(row.best_score, constVal);
      return {
        ...row,
        constVal,
        contrib,
        rank: getRank(row.best_score),
        ratingDisplay: calculateDisplayRate(contrib),
      };
    });
  }, [initialScores]);

  // Overall Rate Calculation (Top 40 songs)
  const overallRate = useMemo(() => {
    const sortedByContrib = [...enrichedScores].sort((a, b) => b.contrib - a.contrib);
    const top40 = sortedByContrib.slice(0, 40);
    const sum = top40.reduce((acc, curr) => acc + curr.contrib, 0);
    return sum.toFixed(3);
  }, [enrichedScores]);

  // Sorting Logic
  const sortedScores = useMemo(() => {
    return [...enrichedScores].sort((a, b) => {
      let valA: any;
      let valB: any;

      // Special handling for computed
      if (sortColumn === 'rating') {
        valA = a.contrib;
        valB = b.contrib;
      } else {
        // Safe access because we know the other columns exist on 'a' and 'b' (except rating)
        valA = a[sortColumn as keyof typeof a];
        valB = b[sortColumn as keyof typeof b];
      }
      
      // Handle nulls
      if (valA === null) valA = "";
      if (valB === null) valB = "";

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [enrichedScores, sortColumn, sortDirection]);

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('desc'); // default desc for new col
    }
  };

  const SortIcon = ({ col }: { col: SortColumn }) => {
    if (sortColumn !== col) return <span className="text-[var(--color-foreground)] opacity-20 ml-1">⇅</span>;
    return <span className="text-[var(--color-accent)] ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-8">
      {/* User Stats Card */}
      <div className="bg-[var(--color-header-bg)] rounded-2xl p-6 shadow-sm border border-[var(--color-header-border)] flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[var(--color-header-border)] bg-[var(--color-menu-hover)]">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={userImage} alt={userName || "User"} className="object-cover w-full h-full" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-foreground)] opacity-60 font-medium uppercase tracking-wider">Player Name</p>
            <h2 className="text-2xl font-bold text-[var(--color-foreground)] game-text-stroke">{userName || "Guest Player"}</h2>
          </div>
        </div>
        
        <div className="text-center sm:text-right">
          <p className="text-sm text-[var(--color-foreground)] opacity-60 font-medium uppercase tracking-wider">Overall Rate (Top 40)</p>
          <div className={`text-5xl tracking-tight game-text-stroke ${getRateColorClass(parseFloat(overallRate))}`}>
            {overallRate}
          </div>
        </div>
      </div>

      {/* Score Table */}
      <div className="bg-[var(--color-card-bg)] rounded-xl shadow-sm border border-[var(--color-header-border)] overflow-hidden transition-colors duration-300">
         {/* Mobile Card View (Visible only on small screens?) - For now, scrollable table is easiest for "Excel-like" data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-menu-hover)] text-[var(--color-foreground)] font-semibold uppercase tracking-wider text-xs border-b border-[var(--color-header-border)]">
              <tr>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group select-none"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                     楽曲名 / 難易度 <SortIcon col="title" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group select-none"
                  onClick={() => handleSort('best_score')}
                >
                  <div className="flex items-center justify-end">
                    スコア <SortIcon col="best_score" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center">ランク</th>
                <th 
                  className="px-6 py-4 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group select-none"
                  onClick={() => handleSort('const_value')}
                >
                  <div className="flex justify-center items-center">
                    譜面定数 <SortIcon col="const_value" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group select-none"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center justify-end">
                    単曲レート <SortIcon col="rating" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group select-none"
                  onClick={() => handleSort('updated_at')}
                >
                  <div className="flex items-center justify-end">
                    更新日 <SortIcon col="updated_at" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-header-border)]">
              {sortedScores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-foreground)] opacity-60">
                    <p className="mb-2 text-lg font-medium">データがありません</p>
                    <p className="text-sm">デバッグボタンを押してデータを追加してください。</p>
                  </td>
                </tr>
              ) : (
                sortedScores.map((row) => (
                  <tr 
                    key={row.chart_id} 
                    className="hover:bg-[var(--color-menu-hover)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--color-foreground)] text-base">{row.title || row.chart_id}</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide border ${getDiffColorClass(row.difficulty)}`}>
                             {row.difficulty || "UNKNOWN"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-base tabular-nums text-[var(--color-foreground)] opacity-90">
                      {row.best_score.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`
                        inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold leading-none min-w-[3rem] shadow-sm
                        ${getRankColorClassForBadge(row.rank)}
                      `}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--color-foreground)] opacity-60 tabular-nums text-xs">
                      {row.constVal.toFixed(1)}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold tabular-nums text-lg ${getRateColorClass(parseFloat(row.ratingDisplay))}`}>
                      {row.ratingDisplay}
                    </td>
                    <td className="px-6 py-4 text-right text-[var(--color-foreground)] opacity-60 text-xs tabular-nums">
                      {new Date(row.updated_at).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// TODO: Update these mainly static color classes to be theme compatible if needed. 
// For now, we will leave them as they provide semantic meaning (Yellow for S+, etc)
// but we might want to ensure they aren't unreadable in Dark Mode.
// The "text-xxx-700" might be hard to read on dark backgrounds if the background is also dark.
// But the badges have their own "bg-xxx-50" or similar.
function getRankColorClassForBadge(rank: string) {
  // Using specific Tailwind colors. In dark mode, we might want to invert or adjust.
  // For simplicity, we can trust they look "okay" as badges, or use "dark:" variants if we want to perfect it.
  switch (rank) {
    case "S+": return "bg-gradient-to-br from-yellow-100 to-amber-200 text-yellow-900 border border-yellow-300";
    case "S":  return "bg-amber-100 text-amber-900 border border-amber-200";
    case "AAA": return "bg-purple-100 text-purple-900 border border-purple-200";
    case "AA": return "bg-indigo-100 text-indigo-900 border border-indigo-200";
    case "A":  return "bg-blue-100 text-blue-900 border border-blue-200";
    case "BBB": return "bg-sky-100 text-sky-900 border border-sky-200";
    case "BB": return "bg-emerald-100 text-emerald-900 border border-emerald-200";
    case "B":  return "bg-teal-100 text-teal-900 border border-teal-200";
    default:   return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

function getDiffColorClass(diff: string | null) {
  // Default/Unknown (includes EXPERT per instruction) -> Orange to differ from Insanity(Gray)
  if (!diff) return "bg-orange-100 text-orange-900 border-orange-200";
  
  const d = diff.toUpperCase();
  
  if (d.includes("RAVAGE")) return "bg-red-100 text-red-900 border-red-200";
  if (d.includes("INSANITY")) return "bg-slate-200 text-slate-800 border-slate-300"; // Gray
  if (d.includes("MASTER")) return "bg-purple-100 text-purple-900 border-purple-200";
  if (d.includes("HARD")) return "bg-yellow-100 text-yellow-900 border-yellow-200";
  if (d.includes("NORMAL")) return "bg-blue-100 text-blue-900 border-blue-200";
  
  // Default for unmatching (e.g. EXPERT, EASY if exists)
  return "bg-orange-100 text-orange-900 border-orange-200";
}
