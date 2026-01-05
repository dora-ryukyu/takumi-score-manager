import { X, Download, ImageIcon, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface BestImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string | null;
  isLoading: boolean;
  userName?: string;
}

export default function BestImageModal({ isOpen, onClose, imageDataUrl, isLoading, userName }: BestImageModalProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'copied' | 'error'>('idle');
  
  if (!isOpen) return null;

  const handleShare = async () => {
    if (!imageDataUrl) return;
    
    setShareStatus('sharing');
    
    try {
      // Convert data URL to blob for sharing
      const response = await fetch(imageDataUrl);
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
      // User cancelled share or error occurred
      setShareStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-[var(--color-card-bg)] rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-header-border)]">
          <h3 className="text-lg font-bold text-[var(--color-foreground)] flex items-center gap-2">
            <ImageIcon className="text-[var(--color-accent)]" size={20} />
            レート対象曲画像生成
          </h3>
          <button 
            onClick={onClose}
            className="text-[var(--color-foreground)] opacity-60 hover:opacity-100 p-2 rounded-full hover:bg-[var(--color-menu-hover)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-menu-hover)] flex items-center justify-center min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 text-[var(--color-foreground)] opacity-70">
              <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <p className="font-medium animate-pulse">画像を生成中...</p>
            </div>
          ) : imageDataUrl ? (
            <div className="relative shadow-lg rounded-lg overflow-hidden border border-[var(--color-header-border)]">
               {/* Use standard img for data URL usually, Next Image needs strict config. 
                   Since it's a data URL, good old img is fine and responsive. */}
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={imageDataUrl} 
                 alt="Best 40 Scores" 
                 className="max-w-full h-auto max-h-[60vh] object-contain"
               />
            </div>
          ) : (
             <p className="text-[var(--color-foreground)] opacity-50">画像の生成に失敗しました。</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--color-card-bg)] border-t border-[var(--color-header-border)] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-menu-hover)] rounded-lg transition-colors"
          >
            閉じる
          </button>
          
          {imageDataUrl && (
            <>
              <button
                onClick={handleShare}
                disabled={shareStatus === 'sharing'}
                className="px-6 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <Share2 size={18} />
                {shareStatus === 'sharing' ? '共有中...' : shareStatus === 'copied' ? 'クリップボードにコピー！' : 'SNSで共有'}
              </button>
              <a 
                href={imageDataUrl} 
                download={`takumi3_best_${userName ? userName + '_' : ''}${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/[\/\s:]/g, '-')}.png`}
                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <Download size={18} />
                画像を保存
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

