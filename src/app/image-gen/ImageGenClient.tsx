'use client';

import { useState, useMemo, useEffect } from 'react';
import { getRank } from "@/lib/rank";
import { calculateSongContrib, calculateDisplayRate } from "@/lib/rating";
import { Info, Download, Share2, RefreshCw } from "lucide-react";
import { generateBestImage, BestImageScore, BestImageProfile } from "@/lib/canvas-generator";
import Link from 'next/link';

interface ScoreRow {
  chart_id: string;
  best_score: number;
  const_value: number | null;
  title: string | null;
  difficulty: string | null;
  updated_at: string;
}

interface ImageGenClientProps {
  initialScores: ScoreRow[];
  userName: string | null | undefined;
  userImage: string;
}

export default function ImageGenClient({ initialScores, userName, userImage }: ImageGenClientProps) {
  // Image Generation State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'copied' | 'error'>('idle');

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
  // contrib 0（スコア80万未満・未プレイ）の譜面はレート対象から除外
  const overallRate = useMemo(() => {
    const sortedByContrib = [...enrichedScores]
      .filter(s => s.contrib > 0)
      .sort((a, b) => b.contrib - a.contrib);
    const top40 = sortedByContrib.slice(0, 40);
    const sum = top40.reduce((acc, curr) => acc + curr.contrib, 0);
    return sum.toFixed(3);
  }, [enrichedScores]);

  const handleGenerateImage = async () => {
    if (enrichedScores.length === 0) return;
    
    setGeneratedImage(null); 
    setIsGenerating(true);
      
    try {
      // Prepare data sorted by rating (contrib 0 の譜面は対象外)
      const topScores = [...enrichedScores]
        .filter(s => s.contrib > 0)
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
  };

  useEffect(() => {
    handleGenerateImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    if (!generatedImage) return;
    
    setShareStatus('sharing');
    
    try {
      // Convert data URL to blob for sharing
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], `takumi3_best_${userName || 'player'}.png`, { type: 'image/png' });
      
      // Check if Web Share API is available and supports files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        const shareText = `#TAKUMI_Cubic #TAKUMI3_Score_Manager\n${userName || 'Player'}のTAKUMI³レート対象曲画像\nhttps://takumi-score-manager.otoge.workers.dev`;
        await navigator.share({
          title: 'TAKUMI³ Score Manager - レート対象曲',
          text: shareText,
          files: [file],
        });
        setShareStatus('idle');
      } else {
        // Fallback: Copy image to clipboard if possible, otherwise show message
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          setShareStatus('copied');
          setTimeout(() => setShareStatus('idle'), 3000);
        } catch {
          // If clipboard doesn't work, show Twitter share option
          const tweetText = encodeURIComponent(`#TAKUMI_Cubic #TAKUMI3_Score_Manager\n${userName || 'Player'}のTAKUMI³レート対象曲画像\nhttps://takumi-score-manager.otoge.workers.dev\n画像を添付して投稿してください！`);
          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
          setShareStatus('idle');
        }
      }
    } catch (error) {
      setShareStatus('idle');
    }
  };

  if (enrichedScores.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] rounded-2xl p-8 text-center border border-[var(--color-header-border)] shadow-sm">
        <p className="mb-2 text-lg font-bold text-[var(--color-foreground)]">スコアデータがありません</p>
        <p className="text-sm text-[var(--color-foreground)] opacity-60 mb-6">画像を生成するには、まずスコアをインポートしてください。</p>
        <Link href="/import" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white font-bold rounded-xl shadow hover:opacity-90 transition-opacity">
          <Download size={18} />
          スコアをインポートする
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-card-bg)] rounded-2xl p-6 shadow-sm border border-[var(--color-header-border)]">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image Preview Area */}
          <div className="flex-1 flex items-center justify-center bg-[var(--color-menu-hover)] rounded-xl min-h-[400px] border border-[var(--color-header-border)] overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4 text-[var(--color-foreground)] opacity-70">
                <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                <p className="font-medium animate-pulse">画像を生成中...</p>
              </div>
            ) : generatedImage ? (
               <>
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                   src={generatedImage} 
                   alt="Best 40 Scores" 
                   className="max-w-full h-auto object-contain shadow-lg"
                 />
               </>
            ) : (
               <p className="text-[var(--color-foreground)] opacity-50">画像の生成に失敗しました。</p>
            )}
          </div>

          {/* Action Buttons Area */}
          <div className="w-full md:w-64 space-y-4 flex-shrink-0">
            <div className="flex items-start gap-3 p-4 bg-[var(--color-menu-hover)] rounded-xl text-sm text-[var(--color-foreground)] opacity-80 mb-6">
              <Info size={20} className="text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
              <p>画像はゲーム風のデザインで生成されます。SNSへの共有や記録の保存にご利用ください。</p>
            </div>

            <button
              onClick={handleShare}
              disabled={!generatedImage || shareStatus === 'sharing'}
              className="w-full flex justify-center items-center gap-2 px-6 py-3 font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-xl shadow hover:shadow-lg transition-all"
            >
              <Share2 size={18} />
              {shareStatus === 'sharing' ? '共有中...' : shareStatus === 'copied' ? 'コピーしました！' : 'SNSで共有'}
            </button>

            {generatedImage && (
              <a 
                href={generatedImage} 
                download={`takumi3_best_${userName ? userName + '_' : ''}${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/[\/\s:]/g, '-')}.png`}
                className="w-full flex justify-center items-center gap-2 px-6 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow hover:shadow-lg transition-all"
              >
                <Download size={18} />
                画像を保存
              </a>
            )}

            <div className="pt-4 border-t border-[var(--color-header-border)]">
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 font-medium text-[var(--color-foreground)] opacity-80 hover:opacity-100 hover:bg-[var(--color-menu-hover)] border border-[var(--color-header-border)] rounded-xl transition-all"
              >
                <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
                {isGenerating ? "生成中..." : "画像を再生成"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
