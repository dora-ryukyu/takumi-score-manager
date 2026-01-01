"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu as MenuIcon, 
  X, 
  Settings, 
  FileSpreadsheet, 
  ImageIcon, 
  ListMusic, 
  Moon, 
  Sun,
  LogOut,
  Calculator,
  BookOpen
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { SignOutButton } from "@clerk/nextjs";

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleOpen = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: "/dashboard", label: "スコア一覧", icon: ListMusic },
    { href: "/import", label: "CSVインポート", icon: FileSpreadsheet },
    { href: "/image-gen", label: "ベスト枠画像生成", icon: ImageIcon },
    { href: "/calculator", label: "計算機", icon: Calculator },
    { href: "/guide", label: "使い方", icon: BookOpen },
    { href: "/settings", label: "設定", icon: Settings },
  ];

  return (
    <>
      <button 
        onClick={toggleOpen}
        className="p-2 text-[var(--color-foreground)] hover:bg-[var(--color-menu-hover)] rounded-lg transition-colors"
        aria-label="Menu"
      >
        <MenuIcon size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleOpen}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-[var(--color-card-bg)] shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-header-border)]">
            <span className="font-bold text-lg">メニュー</span>
            <button 
              onClick={toggleOpen}
              className="p-1 hover:bg-[var(--color-menu-hover)] rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[var(--color-foreground)] hover:bg-[var(--color-menu-hover)] rounded-lg transition-colors"
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
               {/* Debug Menu - Separated */}
               <li>
                  <Link 
                    href="/dashboard/debug"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[var(--color-foreground)] hover:bg-[var(--color-menu-hover)] rounded-lg transition-colors opacity-70 hover:opacity-100"
                  >
                    <Settings size={20} className="text-red-400"/>
                    <span>デバッグメニュー</span>
                  </Link>
                </li>
            </ul>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[var(--color-header-border)] space-y-2">
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-[var(--color-foreground)] hover:bg-[var(--color-menu-hover)] rounded-lg transition-colors"
            >
              {theme === 'modern-light' ? <Sun size={20} /> : <Moon size={20} />}
              <span className="flex-1">
                {theme === 'modern-light' ? 'ライトテーマ' : 'ダークテーマ'}
              </span>
              <span className="text-xs opacity-50 border border-[var(--color-foreground)] px-1 rounded">切替</span>
            </button>
            
            <SignOutButton>
                <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <LogOut size={20} />
                    <span>ログアウト</span>
                </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </>
  );
}
