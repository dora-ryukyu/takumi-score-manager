'use client';

import { useState, useMemo } from 'react';
import { getRank } from "@/lib/rank";
import { getRateColorClass } from "@/lib/colors";
import { calculateSongContrib, calculateDisplayRate } from "@/lib/rating";

interface ScoreRow {
  chart_id: string;
  best_score: number;
  const_value: number | null;
  updated_at: string;
}

interface ScoreListClientProps {
  initialScores: ScoreRow[];
  userName: string | null | undefined;
  userImage: string;
}

type SortColumn = 'chart_id' | 'best_score' | 'rating' | 'updated_at' | 'const_value';
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

  // Overall Rate Calculation
  // Top 40 songs
  const overallRate = useMemo(() => {
    const sortedByContrib = [...enrichedScores].sort((a, b) => b.contrib - a.contrib);
    const top40 = sortedByContrib.slice(0, 40);
    const sum = top40.reduce((acc, curr) => acc + curr.contrib, 0);
    // Display = sum * 40 ?? Wait, logic says sum * 40?
    // Let's check rating.ts: "round(sum * 40, 3)"? 
    // Wait, typical systems:
    // If calculateSongContrib returns "contrib" (which is usually tiny, like 0.3-0.5 per song?), then sum * 40 makes sense?
    // Let's re-read rating.ts:
    // "return (chartConst + bonus) / 34" -> 20.0 rating gives approx 0.58? 
    // Actually, normally rating is sum of 40 songs.
    // Let's check rating.ts calculateOverallRate logic:
    // "sum = top40.reduce...; return (sum * 40).toFixed(3)"
    // If a single song is 15.0, contrib = around 0.44?
    // 0.44 * 40 songs = 17.6?
    // Actually typically: single song rating (e.g. 15.00) is what is displayed.
    // If the library says calculateSongContrib returns a small number, and then multiplies by 40 for display, 
    // then for Overall Rate, we usually sum the Top 40 *Single Song Ratings* / 40? Or just sum of Contribs?
    // The library says: sum of contribs * 40. I will trust the library.
    
    // Wait, if I want to display single song rating, I do contrib * 40.
    // If I want to display overall rating: 
    // The library `calculateOverallRate` does `sum * 40`.
    // So if I have 40 songs with contrib X, total is 40*X.
    // Then overall is (40*X) * 40 = 1600*X ?? That seems wrong if X is ~0.5.
    // Ah, `calculateOverallRate` takes `top40Contribs`.
    // Let's check the library logic again.
    // Library: `return (chartConst + bonus) / 34;` -> this is small.
    // Display Single: `contrib * 40`.
    // Overall: `sum(contribs) * 40`.
    // If I have 1 song with rating 15.0. 
    // Contrib = 15.0 / 40 = 0.375.
    // Overall = 0.375 * 40 = 15.0.
    // If I have 40 songs with rating 15.0.
    // Sum Contribs = 40 * 0.375 = 15.0.
    // Overall = 15.0 * 40 = 600.0 ??? 
    // Usually Overall Rate is around the same scale (0-20ish).
    // Maybe the requirement 7.3 says "Top 40 songs song_contrib sum"?
    // If so, 15.0. 
    // But `calculateOverallRate` in rating.ts does `sum * 40`.
    // So 15.0 * 40 = 600. 
    // This implies the scale for Overall Rate `(user_rate)` is different (~1000s) or the library logic might be `avg`?
    // BUT, USER instructions say specific colors for "19.000~", "18.000~".
    // This implies Overall Rate is also on 0-20 scale.
    // PROBABLY `rating.ts` `calculateOverallRate` is: `return rawOverall.toFixed(3)` where `rawOverall = sum`.
    // Let's check `rating.ts` content I read earlier.
    // Line 65: `const rawOverall = sum * 40;`
    // This would result in ~600 for a good player.
    // Maybe the user wants "Average Rating" or the "Rate Color Logic" applies to *Single Song Rating*.
    // The prompt says: "User Stats Header... Overall Rate (Calculate sum of top 40 songs). Use the Rate Color Logic for the Overall Rate number."
    // If Overall Rate is 600, then "19.000~" threshold makes no sense.
    // OR, maybe the Rate Color Logic applies to *Average* or *Single* mainly, and Overall is just a number.
    // However, usually in games like Chunithm/Arcaea, potential/rating is 0-20.
    // If Takumi3 follows similar, maybe the "const/34" is wrong?
    // Let's look at `rating.ts` again.
    // `return (chartConst + bonus) / 34`
    // If chartConst is 14.0. Bonus max is 2. (16.0) / 34 ~= 0.47.
    // Display = 0.47 * 40 = 18.8.
    // So 18.8 is a reasonable single song rating.
    // If I have 40 songs of 18.8. Sum of contribs = 40 * 0.47 = 18.8.
    // If `rating.ts` multiplies by 40 AGAIN, it becomes 752.
    // I suspect `rating.ts` `calculateOverallRate` might be intended for a "Total Power" type metric (0-1000 range), OR it is incorrect for a "Rating" (0-20 range).
    // Given the prompt's Color Logic table (which stops at 19+), it strongly implies a 0-20 scale for *whatever* we are coloring.
    // The prompt says "Overall Rate... Use the Rate Color Logic".
    // This implies Overall Rate should be 0-20 scale.
    // So `sum of contribs` (which is ~18.8) is the correct value.
    // The `rating.ts` `calculateOverallRate` doing `sum * 40` might be for a different metric or I should essentially ignore it if I want 0-20 scale.
    // I will display logic: simply `sum(top40 contribs)`. This matches the scale.
    
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
    if (sortColumn !== col) return <span className="text-slate-300 ml-1">⇅</span>;
    return <span className="text-blue-600 ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-8">
      {/* User Stats Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={userImage} alt={userName || "User"} className="object-cover w-full h-full" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Player Name</p>
            <h2 className="text-2xl font-bold text-slate-900">{userName || "Guest Player"}</h2>
          </div>
        </div>
        
        <div className="text-center sm:text-right">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Overall Rate (Top 40)</p>
          <div className={`text-5xl tracking-tight ${getRateColorClass(parseFloat(overallRate))}`}>
            {overallRate}
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          disabled
          className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all group"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <span className="font-bold">CSVインポート (Coming Soon)</span>
        </button>
        <button 
          disabled
          className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all group"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="font-bold">ベスト枠画像生成 (Coming Soon)</span>
        </button>
      </div>

      {/* Score Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         {/* Mobile Card View (Visible only on small screens?) - For now, scrollable table is easiest for "Excel-like" data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                  onClick={() => handleSort('chart_id')}
                >
                  <div className="flex items-center">
                     楽曲ID / 難易度 <SortIcon col="chart_id" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                  onClick={() => handleSort('best_score')}
                >
                  <div className="flex items-center justify-end">
                    スコア <SortIcon col="best_score" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center">ランク</th>
                <th 
                  className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                  onClick={() => handleSort('const_value')}
                >
                  <div className="flex justify-center items-center">
                    譜面定数 <SortIcon col="const_value" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center justify-end">
                    単曲レート <SortIcon col="rating" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                  onClick={() => handleSort('updated_at')}
                >
                  <div className="flex items-center justify-end">
                    更新日 <SortIcon col="updated_at" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedScores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <p className="mb-2 text-lg font-medium text-slate-700">データがありません</p>
                    <p className="text-sm">デバッグボタンを押してデータを追加してください。</p>
                  </td>
                </tr>
              ) : (
                sortedScores.map((row) => (
                  <tr 
                    key={row.chart_id} 
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium font-mono text-slate-700">
                      {row.chart_id}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-base tabular-nums text-slate-600">
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
                    <td className="px-6 py-4 text-center text-slate-400 tabular-nums text-xs">
                      {row.constVal.toFixed(1)}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold tabular-nums text-lg ${getRateColorClass(parseFloat(row.ratingDisplay))}`}>
                      {row.ratingDisplay}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 text-xs tabular-nums">
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

function getRankColorClassForBadge(rank: string) {
  switch (rank) {
    case "S+": return "bg-gradient-to-br from-yellow-100 to-amber-200 text-yellow-800 border border-yellow-300";
    case "S":  return "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border border-amber-200";
    case "AAA": return "bg-purple-100 text-purple-700 border border-purple-200";
    case "AA": return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    case "A":  return "bg-blue-50 text-blue-700 border border-blue-200";
    case "BBB": return "bg-sky-50 text-sky-700 border border-sky-200";
    case "BB": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "B":  return "bg-teal-50 text-teal-700 border border-teal-200";
    default:   return "bg-slate-50 text-slate-500 border border-slate-200";
  }
}
