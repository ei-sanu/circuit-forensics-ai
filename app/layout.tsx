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
    <html lang="en" suppressHydrationWarning className="light scroll-smooth" data-theme="light">
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
                localStorage.setItem('circuit_theme', 'light');
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
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
      <body className="bg-white text-neutral-950 min-h-screen antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
