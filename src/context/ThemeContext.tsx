"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "modern-light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * 保存済みテーマの初期値を読み込む
 * 実際の <html data-theme> 設定は layout.tsx のインラインスクリプト（head内）が
 * ペイント前に実行するため、ここでは現在の属性値から状態を初期化する
 */
function getInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "modern-light" || attr === "dark") return attr;
  }
  return "modern-light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // 状態と <html> の属性を同期する（インラインスクリプトで設定済みのはずだが確実に）
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("app-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleTheme = () => {
    // Toggle between Light and Dark
    const newTheme: Theme = theme === "modern-light" ? "dark" : "modern-light";
    setTheme(newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
