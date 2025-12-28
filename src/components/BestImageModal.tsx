import { X, Download, ImageIcon } from "lucide-react";
import Image from "next/image";

interface BestImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string | null;
  isLoading: boolean;
}

export default function BestImageModal({ isOpen, onClose, imageDataUrl, isLoading }: BestImageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="text-blue-600" size={20} />
            ベスト枠画像生成
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex items-center justify-center min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 text-slate-500">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="font-medium animate-pulse">画像を生成中...</p>
            </div>
          ) : imageDataUrl ? (
            <div className="relative shadow-lg rounded-lg overflow-hidden border border-slate-200">
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
             <p className="text-slate-400">画像の生成に失敗しました。</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            閉じる
          </button>
          
          {imageDataUrl && (
            <a 
              href={imageDataUrl} 
              download={`takumi3_best_${new Date().toISOString().split('T')[0]}.png`}
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Download size={18} />
              画像を保存
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
