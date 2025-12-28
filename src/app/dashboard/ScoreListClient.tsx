'use client';

import { useState, useMemo } from 'react';
import { getRank } from "@/lib/rank";
import { getRateColorClass } from "@/lib/colors";
import { calculateSongContrib, calculateDisplayRate } from "@/lib/rating";
import { LayoutDashboard, Settings, FileUp, Image as ImageIcon } from "lucide-react";
import { generateBestImage, BestImageScore, BestImageProfile } from "@/lib/canvas-generator";
import BestImageModal from "@/components/BestImageModal";

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
  
  // Image Generation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Handle Image Generation
  const handleGenerateImage = async () => {
    setIsModalOpen(true);
    if (!generatedImage) {
      setIsGenerating(true);
      
      // Small delay to allow modal to open
      setTimeout(async () => {
        try {
          // Prepare data sorted by rating
          const topScores = [...enrichedScores]
            .sort((a, b) => b.contrib - a.contrib)
            .slice(0, 40)
            .map(s => ({
              title: s.title || s.chart_id,
              difficulty: s.difficulty || "UNKNOWN",
              score: s.best_score,
              rank: s.rank,
              constVal: s.constVal,
              rating: s.ratingDisplay,
              contrib: s.contrib
            } as BestImageScore));

          const profile: BestImageProfile = {
            name: userName || "Player",
            rate: overallRate,
            date: new Date().toLocaleDateString("ja-JP"),
            userImageUrl: userImage
          };

          const dataUrl = await generateBestImage(topScores, profile);
          setGeneratedImage(dataUrl);
        } catch (e) {
          console.error("Failed to generate image", e);
        } finally {
          setIsGenerating(false);
        }
      }, 100);
    }
  };


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
          <FileUp size={24} />
          <span className="font-bold">CSVインポート (Coming Soon)</span>
        </button>
        <button 
          onClick={handleGenerateImage}
          className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all group"
        >
          <ImageIcon size={24} />
          <span className="font-bold">ベスト枠画像生成</span>
        </button>
      </div>

      <BestImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        imageDataUrl={generatedImage}
        isLoading={isGenerating}
      />

      {/* Score Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         {/* Mobile Card View (Visible only on small screens?) - For now, scrollable table is easiest for "Excel-like" data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                     楽曲名 / 難易度 <SortIcon col="title" />
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
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-base">{row.title || row.chart_id}</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide border ${getDiffColorClass(row.difficulty)}`}>
                             {row.difficulty || "UNKNOWN"}
                          </span>
                        </div>
                      </div>
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

function getDiffColorClass(diff: string | null) {
  if (!diff) return "bg-slate-100 text-slate-500 border-slate-200";
  const d = diff.toUpperCase();
  if (d.includes("MASTER")) return "bg-purple-50 text-purple-700 border-purple-200";
  if (d.includes("EXPERT")) return "bg-red-50 text-red-700 border-red-200";
  if (d.includes("HARD")) return "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (d.includes("NORMAL")) return "bg-green-50 text-green-700 border-green-200";
  if (d.includes("EASY")) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-100 text-slate-500 border-slate-200";
}
