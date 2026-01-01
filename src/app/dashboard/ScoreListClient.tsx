'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]);
  const [levelMin, setLevelMin] = useState<string>('');
  const [levelMax, setLevelMax] = useState<string>('');
  const [scoreMin, setScoreMin] = useState<string>('');
  const [scoreMax, setScoreMax] = useState<string>('');
  const [rateMin, setRateMin] = useState<string>('');
  const [rateMax, setRateMax] = useState<string>('');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter Logic
  const filteredScores = useMemo(() => {
    return enrichedScores.filter(row => {
      // Difficulty: Check if row.difficulty includes ANY of the selected difficulty strings
      if (difficultyFilter.length > 0) {
        if (!row.difficulty) return false;
        const rowDiffUpper = row.difficulty.toUpperCase();
        // Returns true if rowDiffUpper contains any of the selected filters
        const matches = difficultyFilter.some(filterDiff => rowDiffUpper.includes(filterDiff));
        if (!matches) return false;
      }
      
      // Chart Constant
      const lvl = row.constVal;
      if (levelMin !== '' && lvl < parseFloat(levelMin)) return false;
      if (levelMax !== '' && lvl > parseFloat(levelMax)) return false;

      // Score
      const sc = row.best_score;
      if (scoreMin !== '' && sc < parseInt(scoreMin, 10)) return false;
      if (scoreMax !== '' && sc > parseInt(scoreMax, 10)) return false;

      // Rating
      const rt = parseFloat(row.ratingDisplay);
      if (rateMin !== '' && rt < parseFloat(rateMin)) return false;
      if (rateMax !== '' && rt > parseFloat(rateMax)) return false;

      return true;
    });
  }, [enrichedScores, difficultyFilter, levelMin, levelMax, scoreMin, scoreMax, rateMin, rateMax]);

  // Sorting Logic (operate on filteredScores)
  const sortedScores = useMemo(() => {
    return [...filteredScores].sort((a, b) => {
      let valA: string | number | null;
      let valB: string | number | null;

      // Special handling for computed
      if (sortColumn === 'rating') {
        valA = a.contrib;
        valB = b.contrib;
      } else {
        // Safe access because we know the other columns exist on 'a' and 'b' (except rating)
        valA = a[sortColumn as keyof typeof a] as string | number | null;
        valB = b[sortColumn as keyof typeof b] as string | number | null;
      }
      
      // Handle nulls
      if (valA === null) valA = "";
      if (valB === null) valB = "";

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredScores, sortColumn, sortDirection]);

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('desc'); // default desc for new col
    }
  };

  const toggleDifficulty = (diff: string) => {
    setDifficultyFilter(prev => 
      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
    );
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
          <p className="text-sm text-[var(--color-foreground)] opacity-60 font-medium uppercase tracking-wider">RATING</p>
          <div className={`text-5xl tracking-tight game-text-stroke ${getRateColorClass(parseFloat(overallRate))}`}>
            {overallRate}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-[var(--color-card-bg)] rounded-xl shadow-sm border border-[var(--color-header-border)] p-5 space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <h3 className="font-bold text-[var(--color-foreground)] opacity-80 flex items-center gap-2">
            <span className={`text-[var(--color-accent)] transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span> 絞り込み
          </h3>
          <button className="text-xs font-bold text-[var(--color-accent)] border border-[var(--color-accent)] px-2 py-1 rounded hover:bg-[var(--color-accent)] hover:text-white transition-colors">
            {isFilterOpen ? '閉じる' : '開く'}
          </button>
        </div>
        
        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Difficulty Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-foreground)] opacity-60 uppercase">難易度</label>
              <div className="flex flex-wrap gap-2">
                {['NORMAL', 'HARD', 'MASTER', 'INSANITY', 'RAVAGE'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => toggleDifficulty(diff)}
                    className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                      difficultyFilter.includes(diff)
                        ? getDiffColorClass(diff) + " ring-2 ring-offset-1 ring-offset-[var(--color-card-bg)] ring-blue-400"
                        : "bg-[var(--color-menu-hover)] text-[var(--color-foreground)] border-[var(--color-header-border)] opacity-60 hover:opacity-100"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Constant Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-foreground)] opacity-60 uppercase">譜面定数</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="Min" 
                  value={levelMin} 
                  onChange={e => setLevelMin(e.target.value)}
                  className="w-full bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] rounded px-3 py-1.5 text-sm text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                />
                <span className="text-[var(--color-foreground)] opacity-40">~</span>
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="Max" 
                  value={levelMax} 
                  onChange={e => setLevelMax(e.target.value)}
                  className="w-full bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] rounded px-3 py-1.5 text-sm text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                />
              </div>
            </div>

            {/* Score Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-foreground)] opacity-60 uppercase">スコア</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step="1000" 
                  placeholder="Min" 
                  value={scoreMin} 
                  onChange={e => setScoreMin(e.target.value)}
                  className="w-full bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] rounded px-3 py-1.5 text-sm text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                />
                <span className="text-[var(--color-foreground)] opacity-40">~</span>
                <input 
                  type="number" 
                  step="1000" 
                  placeholder="Max" 
                  value={scoreMax} 
                  onChange={e => setScoreMax(e.target.value)}
                  className="w-full bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] rounded px-3 py-1.5 text-sm text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                />
              </div>
            </div>

            {/* Rate Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-foreground)] opacity-60 uppercase">単曲レート</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Min" 
                  value={rateMin} 
                  onChange={e => setRateMin(e.target.value)}
                  className="w-full bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] rounded px-3 py-1.5 text-sm text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                />
                <span className="text-[var(--color-foreground)] opacity-40">~</span>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Max" 
                  value={rateMax} 
                  onChange={e => setRateMax(e.target.value)}
                  className="w-full bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] rounded px-3 py-1.5 text-sm text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count + Mobile Sort Selector */}
      <div className="flex items-center justify-between text-sm text-[var(--color-foreground)] opacity-80 px-1">
        <div>
          該当件数: <span className="font-bold text-[var(--color-accent)] text-lg">{filteredScores.length}</span> <span className="text-xs opacity-60">/ {enrichedScores.length}</span>
        </div>
        
        {/* Mobile Sort Selector */}
        <div className="md:hidden flex items-center gap-2">
          <select
            value={`${sortColumn}-${sortDirection}`}
            onChange={(e) => {
              const [col, dir] = e.target.value.split('-') as [SortColumn, SortDirection];
              setSortColumn(col);
              setSortDirection(dir);
            }}
            className="bg-[var(--color-card-bg)] border border-[var(--color-header-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
          >
            <option value="rating-desc">レート順 ↓</option>
            <option value="rating-asc">レート順 ↑</option>
            <option value="best_score-desc">スコア順 ↓</option>
            <option value="best_score-asc">スコア順 ↑</option>
            <option value="const_value-desc">定数順 ↓</option>
            <option value="const_value-asc">定数順 ↑</option>
            <option value="title-asc">曲名順 A→Z</option>
            <option value="title-desc">曲名順 Z→A</option>
            <option value="updated_at-desc">更新日順 新→古</option>
            <option value="updated_at-asc">更新日順 古→新</option>
          </select>
        </div>
      </div>

      {/* Score List - Mobile Card View */}
      <div className="md:hidden space-y-3">
        {sortedScores.length === 0 ? (
          <div className="bg-[var(--color-card-bg)] rounded-xl p-8 text-center text-[var(--color-foreground)] opacity-60 border border-[var(--color-header-border)]">
            <p className="mb-2 text-lg font-medium">データがありません</p>
            <p className="text-sm">条件を変更するか、データを追加してください。</p>
          </div>
        ) : (
          sortedScores.map((row) => (
            <div 
              key={row.chart_id}
              className="bg-[var(--color-card-bg)] rounded-xl p-4 border border-[var(--color-header-border)] transition-colors hover:border-[var(--color-accent)]"
            >
              {/* Title & Difficulty Row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/chart/${encodeURIComponent(row.chart_id)}`} className="font-bold text-[var(--color-foreground)] text-base hover:text-blue-400 transition-colors line-clamp-2">
                    {row.title || row.chart_id}
                  </Link>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide border ${getDiffColorClass(row.difficulty)}`}>
                  {row.difficulty || "UNK"}
                </span>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[var(--color-menu-hover)] rounded-lg py-2 px-1">
                  <div className="text-xs opacity-60 mb-0.5">スコア</div>
                  <div className="font-mono text-sm font-bold tabular-nums">{row.best_score.toLocaleString()}</div>
                </div>
                <div className="bg-[var(--color-menu-hover)] rounded-lg py-2 px-1">
                  <div className="text-xs opacity-60 mb-0.5">ランク</div>
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold ${getRankColorClassForBadge(row.rank)}`}>
                    {row.rank}
                  </span>
                </div>
                <div className="bg-[var(--color-menu-hover)] rounded-lg py-2 px-1">
                  <div className="text-xs opacity-60 mb-0.5">定数</div>
                  <div className="text-sm tabular-nums">{row.constVal.toFixed(1)}</div>
                </div>
                <div className="bg-[var(--color-menu-hover)] rounded-lg py-2 px-1">
                  <div className="text-xs opacity-60 mb-0.5">レート</div>
                  <div className={`text-sm font-bold tabular-nums ${getRateColorClass(parseFloat(row.ratingDisplay))}`}>
                    {row.ratingDisplay}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Score Table - Desktop View */}
      <div className="hidden md:block bg-[var(--color-card-bg)] rounded-xl shadow-sm border border-[var(--color-header-border)] overflow-hidden transition-colors duration-300">
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
                    <p className="text-sm">条件を変更するか、データを追加してください。</p>
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
                        <Link href={`/dashboard/chart/${encodeURIComponent(row.chart_id)}`} className="font-bold text-[var(--color-foreground)] text-base hover:underline hover:text-blue-400 transition-colors">
                          {row.title || row.chart_id}
                        </Link>
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
                    <td className="px-6 py-4 text-right tabular-nums text-lg">
                      <span className={getRateColorClass(parseFloat(row.ratingDisplay))}>
                        {row.ratingDisplay}
                      </span>
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

// Color classes for rank badges (semantic colors for visual distinction)
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
