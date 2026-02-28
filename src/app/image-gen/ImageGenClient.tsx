'use client';

import { useState, useMemo } from 'react';
import { getRank } from "@/lib/rank";
import { calculateSongContrib, calculateDisplayRate } from "@/lib/rating";
import { Image as ImageIcon, Info } from "lucide-react";
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

          const dataUrl = await generateBestImage(topScores, profile);
          setGeneratedImage(dataUrl);
        } catch (e) {
          console.error("Failed to generate image", e);
        } finally {
          setIsGenerating(false);
        }
      }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-[var(--color-card-bg)] rounded-2xl p-6 shadow-sm border border-[var(--color-header-border)]">
        <div className="space-y-6">
          {/* Description */}
          <div className="flex items-start gap-3 p-4 bg-[var(--color-menu-hover)] rounded-xl">
            <Info size={20} className="text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[var(--color-foreground)] opacity-80 space-y-2">
              <p>
                現在のレート対象曲の画像を生成します。
                SNSへの共有や記録の保存にご利用ください。
              </p>
              <p className="opacity-60">
                画像はゲーム風のデザインで生成されます。生成処理はお使いの端末上で行われます。
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <button 
            onClick={handleGenerateImage}
            disabled={enrichedScores.length === 0}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon size={24} />
            <span>画像を生成する</span>
          </button>

          {enrichedScores.length === 0 && (
            <p className="text-sm text-center text-[var(--color-foreground)] opacity-60">
              ※ スコアデータがありません。スコアインポートでデータを追加してください。
            </p>
          )}
        </div>
      </div>

      <BestImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        imageDataUrl={generatedImage}
        isLoading={isGenerating}
        userName={userName || undefined}
      />
    </div>
  );
}

