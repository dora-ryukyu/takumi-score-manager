"use client";

import { useState, useEffect } from "react";
import { calculateRating, calculateDisplayRate, calculateRequiredScore } from "@/lib/rating";
import { ArrowRightLeft } from "lucide-react";

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<"scoreToRate" | "rateToScore">("scoreToRate");
  
  // Common State
  const [chartConst, setChartConst] = useState<string>("14.0");
  
  // Score -> Rate State
  const [score, setScore] = useState<string>("1000000");
  const [calculatedRate, setCalculatedRate] = useState<string>("0.000");
  
  // Rate -> Score State
  const [targetRate, setTargetRate] = useState<string>("16.00");
  const [calculatedScore, setCalculatedScore] = useState<number>(0);

  // Effect for Score -> Rate
  useEffect(() => {
    const c = parseFloat(chartConst);
    const s = parseInt(score.replace(/,/g, ""), 10);

    if (!isNaN(c) && !isNaN(s)) {
      const rate = calculateRating(s, c);
      // calculateRating returns rate * 40 (e.g. 16.0)
      // We want to display it formatted.
      // But calculateDisplayRate takes contrib, so we need rate / 40.
      // Let's just manually format rate (since it is already rate value).
      setCalculatedRate(rate.toFixed(3)); // calculatedRating returns exact number like 16.0
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
          
          {/* Chart Constant Input (Shared/Top) */}
          <div className="space-y-3">
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
