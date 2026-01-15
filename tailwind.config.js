/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
        },
        purple: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        pink: {
          400: '#f472b6',
          500: '#ec4899',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
        },
        red: {
          400: '#f87171',
          500: '#ef4444',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
