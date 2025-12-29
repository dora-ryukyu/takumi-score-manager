"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "modern-light" | "dark" | "game-dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("modern-light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("app-theme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("app-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleTheme = () => {
    // Cycle: Light -> Dark -> Game -> Light
    let newTheme: Theme = "modern-light";
    if (theme === "modern-light") newTheme = "dark";
    else if (theme === "dark") newTheme = "game-dark";
    else newTheme = "modern-light";
    
    setTheme(newTheme);
  };

  // Prevent flash of incorrect theme by not rendering until mounted (or render layout but risk flash)
  // For better UX, we can render children but with default theme initially.
  // The useEffect handles the update quickly.
  
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
