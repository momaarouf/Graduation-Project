// ============================================================================
// TAILWIND CONFIG - DUAL COLOR SCHEMES
// ============================================================================
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Global White Override
        white: '#f8fafc', 

        // Global Gray-to-Slate Remapping (Restored for Dark Mode consistency)
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },

        // Trust Blue (Primary)
        'primary-light': '#2563eb',
        'primary-light-hover': '#1d4ed8',
        
        // Success Green
        'success-light': '#10b981',
        'success-light-hover': '#059669',
        
        // Action Orange
        'accent-light': '#f97316',
        'accent-light-hover': '#ea580c',
        
        // Premium Gold
        'premium-light': '#d4af37',
        'premium-light-hover': '#b45309',
        
        // Alert Red
        'danger-light': '#ef4444',
        'danger-light-hover': '#dc2626',
        
        // Background colors for light mode (Creamy Safari)
        'bg-light': {
          primary: '#f5f2ed',          // Stone Cream Base
          secondary: '#efebe4',        // Sand Secondary
          card: '#faf9f6',             // Linen Card
          paper: '#fdfbf7',            // Linen Paper
          hover: '#efebe4',            // Sand Hover
        },
        
        // Text colors for light mode
        'text-light': {
          primary: '#1c1917',          // Stone-900 Charcoal
          secondary: '#57534e',        // Stone-600
          muted: '#a8a29e',            // Stone-400
          inverse: '#f8fafc',
        },
        
        // Border colors for light mode
        'border-light': {
          default: '#e6e2da',          // Stone Border
          strong: '#d6d3d1',           // Stone-300
          accent: '#2563eb',
        },
        
        // DARK MODE COLORS
        'primary-dark': '#3b82f6',
        'primary-dark-hover': '#60a5fa',
        'success-dark': '#34d399',
        'success-dark-hover': '#10b981',
        'accent-dark': '#fb923c',
        'accent-dark-hover': '#f97316',
        'premium-dark': '#fbbf24',
        'premium-dark-hover': '#f59e0b',
        'danger-dark': '#f87171',
        'danger-dark-hover': '#ef4444',
        
        'bg-dark': {
          primary: '#0f172a',          // Slate-900 (Deep Base)
          secondary: '#1e293b',        // Slate-800 (Elevated/Sections)
          card: '#1e293b',             // Slate-800
          paper: '#1e293b',            // Same as card for dark mode elevation
          hover: '#334155',            // Slate-700
        },
        
        'text-dark': {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
          inverse: '#0f172a',
        },
        
        'border-dark': {
          default: '#1e293b',
          strong: '#334155',
          accent: '#3b82f6',
        },
      },
      backgroundImage: {
        'grid-light': 'linear-gradient(to right, rgb(226 232 240 / 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240 / 0.15) 1px, transparent 1px)',
        'grid-dark': 'linear-gradient(to right, rgb(51 65 85 / 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgb(51 65 85 / 0.2) 1px, transparent 1px)',
        'hero-light': 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 1) 50%, rgba(249, 115, 22, 0.05) 100%)',
        'hero-dark': 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(15, 23, 42, 1) 50%, rgba(194, 65, 12, 0.1) 100%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      boxShadow: {
        'card-light': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'elevated-light': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'elevated-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
        'pop-light': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'pop-dark': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
      },
      scale: {
        '102':'1.02',
      },
    },
  },
  plugins: [],
}

export default config