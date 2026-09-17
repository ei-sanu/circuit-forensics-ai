'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export type AccentColor = 'blue' | 'indigo' | 'emerald' | 'violet' | 'amber' | 'cyan';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  accentColor: AccentColor;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (accent: AccentColor) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'circuit_theme';
const ACCENT_STORAGE_KEY = 'circuit_accent';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue');
  const [mounted, setMounted] = useState(false);

  // Helper to get system preference (defaults to light for GoI portal)
  const getSystemTheme = useCallback((): ResolvedTheme => {
    return 'light';
  }, []);

  // Update DOM classes and CSS variables
  const applyThemeToDOM = useCallback((resolved: ResolvedTheme, accent: AccentColor) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (resolved === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-accent', accent);

    // Dispatch global event for Leaflet maps / Cytoscape graph canvas
    window.dispatchEvent(
      new CustomEvent('circuit-theme-changed', {
        detail: { theme: resolved, accent },
      })
    );
  }, []);

  // Initialize theme from storage
  useEffect(() => {
    setMounted(true);
    // Force light portal theme
    const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'light';
    const savedAccent = (localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor) || 'blue';

    setThemeState(savedTheme);
    setAccentColorState(savedAccent);

    const initialResolved: ResolvedTheme = savedTheme === 'dark' ? 'dark' : 'light';
    setResolvedTheme(initialResolved);
    applyThemeToDOM(initialResolved, savedAccent);
  }, [getSystemTheme, applyThemeToDOM]);

  // Handle system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        applyThemeToDOM(newResolved, accentColor);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme, accentColor, applyThemeToDOM]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }

      const newResolved: ResolvedTheme = newTheme === 'system' ? getSystemTheme() : newTheme;
      setResolvedTheme(newResolved);
      applyThemeToDOM(newResolved, accentColor);
    },
    [getSystemTheme, applyThemeToDOM, accentColor]
  );

  const setAccentColor = useCallback(
    (newAccent: AccentColor) => {
      setAccentColorState(newAccent);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACCENT_STORAGE_KEY, newAccent);
      }
      applyThemeToDOM(resolvedTheme, newAccent);
    },
    [resolvedTheme, applyThemeToDOM]
  );

  const toggleTheme = useCallback(() => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: mounted ? resolvedTheme : 'light',
        accentColor,
        setTheme,
        setAccentColor,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
