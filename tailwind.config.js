/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          light: '#f8f9fa',
          'card-light': '#ffffff',
          'border-light': '#e5e7eb',
          dark: '#090d16',
          'card-dark': '#111827',
          'border-dark': '#1f2937',
        },
        // Crisp Luxury White & Deep Charcoal Palette
        canvas: '#ffffff',
        beige: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
        },
        slate: {
          450: '#52595f',
          850: '#232a31',
        },
        charcoal: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#52595f',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#0f172a',
          900: '#090d16',
          950: '#030712',
        },
        // Backwards-compatible aliases
        sand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
        },
        midnight: {
          700: '#334155',
          800: '#1e293b',
          850: '#0f172a',
          900: '#090d16',
          950: '#030712',
        },
      },
      backgroundImage: {
        'beige-gradient': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        'sand-gradient': 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        'dark-pill-gradient': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'charcoal-gradient': 'linear-gradient(180deg, #0f172a 0%, #030712 100%)',
        'glass-card-light': 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%)',
        'glass-card-dark': 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(3, 7, 18, 0.94) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
