'use client';

import { useState, useMemo } from 'react';
import { getRank } from "@/lib/rank";
import { calculateSongContrib, calculateDisplayRate } from "@/lib/rating";
import { Image as ImageIcon, Palette, ArrowLeft } from "lucide-react";
import { generateBestImage, BestImageScore, BestImageProfile, ImageTheme } from "@/lib/canvas-generator";
import BestImageModal from "@/components/BestImageModal";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageTheme, setImageTheme] = useState<ImageTheme>('game'); // Default to Game Mode

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
    
    setGeneratedImage(null); // Clear previous to show loading state
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

          const dataUrl = await generateBestImage(topScores, profile, imageTheme);
          setGeneratedImage(dataUrl);
        } catch (e) {
          console.error("Failed to generate image", e);
        } finally {
          setIsGenerating(false);
        }
      }, 100);
  };

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--color-foreground)] opacity-70 hover:opacity-100 transition-opacity">
        <ArrowLeft size={20} />
        <span>ダッシュボードに戻る</span>
      </Link>

      <div className="bg-[var(--color-card-bg)] rounded-2xl p-6 shadow-sm border border-[var(--color-header-border)]">
        <h2 className="text-xl font-bold mb-6 text-[var(--color-foreground)]">ベスト枠画像生成</h2>
        
        <div className="space-y-6">
           {/* Theme Selector */}
           <div className="flex flex-col sm:flex-row gap-4 items-center">
               <div className="bg-white/5 border border-[var(--color-header-border)] rounded-xl px-4 py-2 flex items-center gap-3 w-full sm:w-auto">
                  <Palette size={20} className="text-[var(--color-foreground)]" />
                  <span className="font-medium text-sm text-[var(--color-foreground)]">画像テーマ:</span>
                  <select 
                    value={imageTheme}
                    onChange={(e) => setImageTheme(e.target.value as ImageTheme)}
                    className="bg-transparent border-none text-[var(--color-foreground)] text-sm focus:ring-0 cursor-pointer"
                  >
                     <option value="game" className="text-black">ゲーム再現 (Dark)</option>
                     <option value="light" className="text-black">モダン (Light)</option>
                  </select>
               </div>
               
               <button 
                onClick={handleGenerateImage}
                className="flex-1 w-full sm:w-auto flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <ImageIcon size={24} />
                <span>画像を生成する</span>
              </button>
           </div>
           
           <p className="text-sm text-[var(--color-foreground)] opacity-60">
             現在のベストスコア上位40曲を使用して、共有用の画像を生成します。<br/>
             生成処理はお使いの端末で行われます。
           </p>
        </div>
      </div>

      <BestImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        imageDataUrl={generatedImage}
        isLoading={isGenerating}
      />
    </div>
  );
}
