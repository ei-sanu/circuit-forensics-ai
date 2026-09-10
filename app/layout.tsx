import React from 'react';
import './globals.css';
import { AppShell } from '@/components/shell/AppShell';

export const metadata = {
  title: 'CIRCUIT — Criminal Intelligence & Investigation Platform',
  description: 'AI-Powered Criminal Intelligence & Relationship Investigation using Connected-Entity Tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-brand-500 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
