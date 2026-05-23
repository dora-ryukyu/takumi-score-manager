'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { getRank } from "@/lib/rank";
import { getRateColorClass } from "@/lib/colors";
import { calculateSongContrib, calculateDisplayRate } from "@/lib/rating";
import { Search, Download, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchAndImportScores } from "@/lib/actions/direct-import";

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
  userId: string;
  userName: string | null | undefined;
  userImage: string;
  savedExternalUserId?: string | null;
  lastImportedAt?: string | null;
}

type SortColumn = 'chart_id' | 'best_score' | 'rating' | 'updated_at' | 'const_value' | 'title';
type SortDirection = 'asc' | 'desc';

export default function ScoreListClient({ initialScores, userId, userName, userImage, savedExternalUserId, lastImportedAt }: ScoreListClientProps) {
  const router = useRouter();
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
  const [searchQuery, setSearchQuery] = useState<string>('');
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
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!row.title?.toLowerCase().includes(q) && 
            !row.chart_id.toLowerCase().includes(q)) {
          return false;
        }
      }

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
  }, [enrichedScores, searchQuery, difficultyFilter, levelMin, levelMax, scoreMin, scoreMax, rateMin, rateMax]);

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

  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{text: string, isError: boolean} | null>(null);

  const handleQuickImport = async () => {
    if (!savedExternalUserId) return;
    setIsImporting(true);
    setImportMessage(null);
    try {
      const res = await fetchAndImportScores(userId, savedExternalUserId);
      if (res.success) {
        if (res.updatedRows > 0) {
          setImportMessage({ text: `${res.updatedRows}件のスコアを更新しました！`, isError: false });
        } else {
          setImportMessage({ text: "すでに最新の状態です。", isError: false });
        }
        router.refresh();
      } else {
        setImportMessage({ text: res.error || "インポートに失敗しました", isError: true });
      }
    } catch(e) {
      setImportMessage({ text: "エラーが発生しました", isError: true });
    } finally {
      setIsImporting(false);
      // Hide message after 5 seconds
      setTimeout(() => setImportMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Import Message Toast */}
      {importMessage && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${
          importMessage.isError ? "bg-[var(--alert-error-bg)] border-[var(--alert-error-border)] text-[var(--alert-error-text)]" 
          : "bg-[var(--alert-success-bg)] border-[var(--alert-success-border)] text-[var(--alert-success-text)]"
        }`}>
          {importMessage.isError ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
          <span className="font-bold">{importMessage.text}</span>
        </div>
      )}

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
            {lastImportedAt && (
              <p className="text-xs text-[var(--color-foreground)] opacity-50 mt-1 font-medium">
                最終更新: {new Date(lastImportedAt).toLocaleString("ja-JP")}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end items-center gap-3">
          <div className="text-center sm:text-right">
            <p className="text-sm text-[var(--color-foreground)] opacity-60 font-medium uppercase tracking-wider">RATING</p>
            <div className={`text-5xl tracking-tight game-text-stroke ${getRateColorClass(parseFloat(overallRate))}`}>
              {overallRate}
            </div>
          </div>
          
          {savedExternalUserId && (
            <button
              onClick={handleQuickImport}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] hover:bg-[var(--color-accent)] hover:text-white transition-colors rounded-lg text-sm font-bold text-[var(--color-foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={isImporting ? "animate-spin" : ""} />
              {isImporting ? "更新中..." : "スコアを更新"}
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-[var(--color-card-bg)] rounded-xl shadow-sm border border-[var(--color-header-border)] p-5 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground)] opacity-40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="楽曲名で検索..."
            className="w-full pl-10 pr-4 py-3 bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] rounded-xl text-sm text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none placeholder:opacity-40"
          />
        </div>

        <div 
          className="flex items-center justify-between cursor-pointer select-none pt-2"
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
          <div className="bg-[var(--color-card-bg)] rounded-xl p-8 text-center border border-[var(--color-header-border)]">
            {enrichedScores.length === 0 ? (
              <>
                <p className="mb-2 text-lg font-bold text-[var(--color-foreground)]">スコアデータがありません</p>
                <p className="text-sm text-[var(--color-foreground)] opacity-60 mb-6">まずはスコアをインポートしましょう</p>
                <Link href="/import" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white font-bold rounded-xl shadow hover:opacity-90 transition-opacity">
                  <Download size={18} />
                  スコアをインポートする
                </Link>
              </>
            ) : (
              <>
                <p className="mb-2 text-lg font-bold text-[var(--color-foreground)] opacity-60">該当する楽曲がありません</p>
                <p className="text-sm text-[var(--color-foreground)] opacity-60">検索条件やフィルターを変更してください。</p>
              </>
            )}
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
                  className="px-6 py-4 cursor-pointer hover:bg-[var(--color-menu-hover)] transition-colors group select-none"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                     楽曲名 / 難易度 <SortIcon col="title" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-[var(--color-menu-hover)] transition-colors group select-none"
                  onClick={() => handleSort('best_score')}
                >
                  <div className="flex items-center justify-end">
                    スコア <SortIcon col="best_score" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center">ランク</th>
                <th 
                  className="px-6 py-4 text-center cursor-pointer hover:bg-[var(--color-menu-hover)] transition-colors group select-none"
                  onClick={() => handleSort('const_value')}
                >
                  <div className="flex justify-center items-center">
                    譜面定数 <SortIcon col="const_value" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-[var(--color-menu-hover)] transition-colors group select-none"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center justify-end">
                    単曲レート <SortIcon col="rating" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-[var(--color-menu-hover)] transition-colors group select-none"
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
                  <td colSpan={6} className="px-6 py-16 text-center">
                    {enrichedScores.length === 0 ? (
                      <div className="flex flex-col items-center justify-center">
                        <p className="mb-2 text-xl font-bold text-[var(--color-foreground)]">スコアデータがありません</p>
                        <p className="text-sm text-[var(--color-foreground)] opacity-60 mb-6">まずはスコアをインポートしましょう</p>
                        <Link href="/import" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white font-bold rounded-xl shadow hover:opacity-90 transition-opacity">
                          <Download size={18} />
                          スコアをインポートする
                        </Link>
                      </div>
                    ) : (
                      <div className="text-[var(--color-foreground)] opacity-60">
                        <p className="mb-2 text-lg font-medium">該当する楽曲がありません</p>
                        <p className="text-sm">検索条件やフィルターを変更してください。</p>
                      </div>
                    )}
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

// Color classes for rank badges (theme-aware via CSS variables)
function getRankColorClassForBadge(rank: string) {
  switch (rank) {
    case "S+": return "bg-[var(--diff-hard-bg)] text-[var(--diff-hard-text)] border border-[var(--diff-hard-border)] font-extrabold";
    case "S":  return "bg-[var(--diff-hard-bg)] text-[var(--diff-hard-text)] border border-[var(--diff-hard-border)]";
    case "AAA": return "bg-[var(--diff-master-bg)] text-[var(--diff-master-text)] border border-[var(--diff-master-border)]";
    case "AA": return "bg-[var(--diff-normal-bg)] text-[var(--diff-normal-text)] border border-[var(--diff-normal-border)]";
    case "A":  return "bg-[var(--diff-normal-bg)] text-[var(--diff-normal-text)] border border-[var(--diff-normal-border)]";
    case "BBB": return "bg-[var(--alert-success-bg)] text-[var(--alert-success-text)] border border-[var(--alert-success-border)]";
    case "BB": return "bg-[var(--alert-success-bg)] text-[var(--alert-success-text)] border border-[var(--alert-success-border)]";
    case "B":  return "bg-[var(--alert-success-bg)] text-[var(--alert-success-text)] border border-[var(--alert-success-border)]";
    default:   return "bg-[var(--diff-insanity-bg)] text-[var(--diff-insanity-text)] border border-[var(--diff-insanity-border)]";
  }
}

function getDiffColorClass(diff: string | null) {
  if (!diff) return "bg-[var(--diff-unknown-bg)] text-[var(--diff-unknown-text)] border-[var(--diff-unknown-border)]";
  
  const d = diff.toUpperCase();
  
  if (d.includes("RAVAGE")) return "bg-[var(--diff-ravage-bg)] text-[var(--diff-ravage-text)] border-[var(--diff-ravage-border)]";
  if (d.includes("INSANITY")) return "bg-[var(--diff-insanity-bg)] text-[var(--diff-insanity-text)] border-[var(--diff-insanity-border)]";
  if (d.includes("MASTER")) return "bg-[var(--diff-master-bg)] text-[var(--diff-master-text)] border-[var(--diff-master-border)]";
  if (d.includes("HARD")) return "bg-[var(--diff-hard-bg)] text-[var(--diff-hard-text)] border-[var(--diff-hard-border)]";
  if (d.includes("NORMAL")) return "bg-[var(--diff-normal-bg)] text-[var(--diff-normal-text)] border-[var(--diff-normal-border)]";
  
  return "bg-[var(--diff-unknown-bg)] text-[var(--diff-unknown-text)] border-[var(--diff-unknown-border)]";
}
