"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu as MenuIcon, 
  X, 
  Settings, 
  Download, 
  ImageIcon, 
  ListMusic, 
  Moon, 
  Sun,
  LogOut,
  Calculator,
  BookOpen,
  Bell
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { SignOutButton } from "@clerk/nextjs";
import { useNewsUnread } from "@/hooks/useNewsUnread";

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNewsUnread();

  const toggleOpen = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: "/dashboard", label: "スコア一覧", icon: ListMusic, badge: 0 },
    { href: "/import", label: "スコアインポート", icon: Download, badge: 0 },
    { href: "/image-gen", label: "レート対象曲画像生成", icon: ImageIcon, badge: 0 },
    { href: "/calculator", label: "計算機", icon: Calculator, badge: 0 },
    { href: "/guide", label: "使い方", icon: BookOpen, badge: 0 },
    { href: "/news", label: "お知らせ", icon: Bell, badge: unreadCount },
    { href: "/settings", label: "設定", icon: Settings, badge: 0 },
  ];

  return (
    <>
      <button 
        onClick={toggleOpen}
        className="relative p-2 text-[var(--color-foreground)] hover:bg-[var(--color-menu-hover)] rounded-lg transition-colors"
        aria-label="Menu"
      >
        <MenuIcon size={24} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex h-2.5 w-2.5"
            aria-label={`${unreadCount}件の未読お知らせ`}
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        )}
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
                    <span className="flex-1">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
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
                <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-[var(--alert-error-bg)] rounded-lg transition-colors">
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
