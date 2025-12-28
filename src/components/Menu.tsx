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
  LogOut
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { SignOutButton } from "@clerk/nextjs";

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleOpen = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: "/dashboard", label: "スコア一覧", icon: ListMusic },
    { href: "/settings", label: "設定", icon: Settings },
    { href: "/import", label: "CSVインポート", icon: FileSpreadsheet }, // Assuming /import route exists or will exist
    { href: "/image-gen", label: "画像生成", icon: ImageIcon },       // Assuming /image-gen route exists or will exist
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
            <span className="font-bold text-lg">Menu</span>
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
            </ul>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[var(--color-header-border)] space-y-2">
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-[var(--color-foreground)] hover:bg-[var(--color-menu-hover)] rounded-lg transition-colors"
            >
              {theme === 'modern-light' ? <Moon size={20} /> : <Sun size={20} />}
              <span>{theme === 'modern-light' ? 'ダークモード' : 'ライトモード'}</span>
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
