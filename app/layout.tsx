import React from 'react';
import './globals.css';
import { AppShell } from '@/components/shell/AppShell';
import { ThemeProvider } from '@/lib/theme';

export const metadata = {
  title: 'CIRCUIT — Criminal Intelligence & Investigation Platform',
  description: 'AI-Powered Criminal Intelligence & Relationship Investigation using Connected-Entity Tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script

          dangerouslySetInnerHTML={{
            __html: `
              try {
                // v2.1 theme reset: clear any stale forced-dark preference from a prior build
                const THEME_VERSION_KEY = 'circuit_theme_ver';
                const CURRENT_THEME_VERSION = '2.1';
                if (localStorage.getItem(THEME_VERSION_KEY) !== CURRENT_THEME_VERSION) {
                  localStorage.removeItem('circuit_theme');
                  localStorage.setItem(THEME_VERSION_KEY, CURRENT_THEME_VERSION);
                }
                const savedTheme = localStorage.getItem('circuit_theme') || 'system';
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = savedTheme === 'dark' || (savedTheme === 'system' && prefersDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}

              window.addEventListener('error', function(e) {
                if (e && e.message && (e.message.includes('fetch') || e.message.includes('Network') || e.message.includes('Failed to load') || e.message.includes('HTTP Error'))) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                }
              });
              window.addEventListener('unhandledrejection', function(e) {
                if (e && e.reason && (String(e.reason).includes('fetch') || String(e.reason).includes('Network') || String(e.reason).includes('HTTP Error'))) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                }
              });
            `,
          }}
        />
      </head>
      <body className="bg-[#f8f9fa] dark:bg-[#090d16] text-neutral-900 dark:text-neutral-100 min-h-screen antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
