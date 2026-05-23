"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { calculateRating, calculateRequiredScore } from "@/lib/rating";
import { ArrowRightLeft, Search, ChevronDown } from "lucide-react";


interface ChartOption {
  chart_id: string;
  title: string;
  difficulty: string;
  const_value: number;
}

interface CalculatorClientProps {
  charts: ChartOption[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  NORMAL: "text-[var(--diff-text-normal,var(--diff-normal-text))]",
  HARD: "text-[var(--diff-text-hard,var(--diff-hard-text))]",
  MASTER: "text-[var(--diff-text-master,var(--diff-master-text))]",
  INSANITY: "text-[var(--diff-text-insanity,var(--diff-insanity-text))]",
  RAVAGE: "text-[var(--diff-text-ravage,var(--diff-ravage-text))]",
};

export default function CalculatorClient({ charts }: CalculatorClientProps) {
  const [activeTab, setActiveTab] = useState<"scoreToRate" | "rateToScore">("scoreToRate");
  
  // Common State
  const [chartConst, setChartConst] = useState<string>("15.0");
  
  // Score -> Rate State
  const [score, setScore] = useState<string>("1000000");
  const [calculatedRate, setCalculatedRate] = useState<string>("0.000");
  
  // Rate -> Score State
  const [targetRate, setTargetRate] = useState<string>("20.000");
  const [calculatedScore, setCalculatedScore] = useState<number>(0);

  // Search/Dropdown State
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCharts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return charts.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.difficulty.toLowerCase().includes(q)
    ).slice(0, 50); // Limit to 50 for performance
  }, [charts, searchQuery]);

  const handleSelectChart = (chart: ChartOption) => {
    setChartConst(chart.const_value.toFixed(1));
    setSearchQuery(`${chart.title} [${chart.difficulty}]`);
    setIsDropdownOpen(false);
  };

  // Effect for Score -> Rate
  useEffect(() => {
    const c = parseFloat(chartConst);
    const s = parseInt(score.replace(/,/g, ""), 10);

    if (!isNaN(c) && !isNaN(s)) {
      const rate = calculateRating(s, c);
      setCalculatedRate(rate.toFixed(3));
    } else {
      setCalculatedRate("---");
    }
  }, [chartConst, score]);

  // Effect for Rate -> Score
  useEffect(() => {
    const c = parseFloat(chartConst);
    const r = parseFloat(targetRate);

    if (!isNaN(c) && !isNaN(r)) {
      const s = calculateRequiredScore(r, c);
      setCalculatedScore(s);
    } else {
      setCalculatedScore(0);
    }
  }, [chartConst, targetRate]);

  return (
    <div className="space-y-8 min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-8">
      <main className="max-w-2xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)]">計算機</h1>
            <p className="text-[var(--color-foreground)] opacity-70 mt-1">
              スコアとレートの相互計算を行います
            </p>
          </div>
        </header>
        
        {/* Tab Switcher */}
        <div className="bg-[var(--color-card-bg)] p-1 rounded-xl flex shadow-sm border border-[var(--color-header-border)]">
          <button
            onClick={() => setActiveTab("scoreToRate")}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
              activeTab === "scoreToRate"
                ? "bg-[var(--color-accent)] text-white shadow-md ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-card-bg)]"
                : "text-[var(--color-foreground)] hover:bg-[var(--color-menu-hover)] opacity-70 hover:opacity-100"
            }`}
          >
            スコア <ArrowRightLeft className="inline mx-1 h-3 w-3" /> レート
          </button>
          <button
            onClick={() => setActiveTab("rateToScore")}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
              activeTab === "rateToScore"
                ? "bg-[var(--color-accent)] text-white shadow-md ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-card-bg)]"
                : "text-[var(--color-foreground)] hover:bg-[var(--color-menu-hover)] opacity-70 hover:opacity-100"
            }`}
          >
            レート <ArrowRightLeft className="inline mx-1 h-3 w-3" /> スコア
          </button>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-card-bg)] rounded-xl border border-[var(--color-header-border)] shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Chart Selection and Constant Input */}
          <div className="space-y-4">
            {/* Chart Search */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-[var(--color-foreground)] opacity-60 uppercase tracking-wider mb-2">譜面から選択 (任意)</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground)] opacity-40 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="曲名または難易度で検索..."
                  className="w-full pl-9 pr-10 py-3 rounded-xl border border-[var(--color-header-border)] bg-[var(--color-menu-hover)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:opacity-40 text-sm"
                />
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground)] opacity-40" />
              </div>

              {/* Dropdown */}
              {isDropdownOpen && searchQuery.trim() && (
                <div className="absolute z-20 w-full mt-2 bg-[var(--color-card-bg)] border border-[var(--color-header-border)] rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                  {filteredCharts.length > 0 ? (
                    filteredCharts.map((chart) => (
                      <button
                        key={chart.chart_id}
                        onMouseDown={() => handleSelectChart(chart)}
                        className="w-full text-left px-4 py-3 hover:bg-[var(--color-header-fill)] transition-colors flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="font-medium truncate">{chart.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-mono font-bold ${DIFFICULTY_COLORS[chart.difficulty] ?? ""}`}>
                            {chart.difficulty}
                          </span>
                          <span className="text-xs opacity-50 font-mono">
                            {chart.const_value.toFixed(1)}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-[var(--color-foreground)] opacity-60 text-center">
                      見つかりませんでした
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-foreground)] opacity-60 uppercase tracking-wider">譜面定数</label>
              <input
                type="number"
                step="0.1"
                value={chartConst}
                onChange={(e) => setChartConst(e.target.value)}
                className="w-full bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] text-[var(--color-foreground)] rounded-xl px-4 py-4 text-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                placeholder="14.0"
              />
            </div>
          </div>

          <div className="border-t border-[var(--color-header-border)] my-6"></div>

          {activeTab === "scoreToRate" ? (
            /* Score -> Rate UI */
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--color-foreground)] opacity-60 uppercase tracking-wider">スコア</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] text-[var(--color-foreground)] rounded-xl px-4 py-4 text-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                  placeholder="1000000"
                />
              </div>

              <div className="flex flex-col items-center justify-center space-y-3 p-8 bg-[var(--color-menu-hover)] rounded-xl border border-[var(--color-header-border)]">
                <span className="text-xs font-bold text-[var(--color-foreground)] opacity-60 uppercase tracking-wider">単曲レート</span>
                <span className="text-6xl font-black text-[var(--color-accent)] font-mono tracking-tight game-text-stroke">
                  {calculatedRate}
                </span>
              </div>
            </div>
          ) : (
            /* Rate -> Score UI */
            <div className="space-y-8">
               <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--color-foreground)] opacity-60 uppercase tracking-wider">目標レート</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetRate}
                  onChange={(e) => setTargetRate(e.target.value)}
                  className="w-full bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] text-[var(--color-foreground)] rounded-xl px-4 py-4 text-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                  placeholder="16.00"
                />
              </div>

               <div className="flex flex-col items-center justify-center space-y-3 p-8 bg-[var(--color-menu-hover)] rounded-xl border border-[var(--color-header-border)]">
                <span className="text-xs font-bold text-[var(--color-foreground)] opacity-60 uppercase tracking-wider">必要スコア</span>
                <span className="text-6xl font-black text-[var(--color-accent)] font-mono tracking-tight game-text-stroke">
                  {calculatedScore.toLocaleString()}
                </span>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
