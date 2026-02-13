// ============================================================================
// TAILWIND CONFIG - DUAL COLOR SCHEMES
// ============================================================================
// LOCATION: /frontend/tailwind.config.ts
// 
// PURPOSE: Define separate color schemes for light and dark modes.
// 
// IMPORTANT: Tailwind v4 requires explicit color definitions for dark mode.
// We're creating two complete color palettes:
// 
// LIGHT MODE COLORS:
// - Bright, saturated colors on white background
// - High contrast for readability
// 
// DARK MODE COLORS:
// - Muted, desaturated colors on dark background
// - Lower contrast for eye comfort
// 
// USAGE: Use `text-primary-light` for light mode, `text-primary-dark` for dark
// ============================================================================

import type { Config } from 'tailwindcss'

const config: Config = {
  // Files that contain Tailwind classes
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // CRITICAL: Use class-based dark mode
  darkMode: 'class',
  
  theme: {
    extend: {
      // ====================================================================
      // LIGHT MODE COLOR PALETTE (Your original bright colors)
      // ====================================================================
      colors: {
        // Trust Blue (Primary)
        'primary-light': '#2563eb',    // Bright blue
        'primary-light-hover': '#1d4ed8',
        
        // Success Green
        'success-light': '#10b981',    // Bright green
        'success-light-hover': '#059669',
        
        // Action Orange
        'accent-light': '#f97316',     // Bright orange
        'accent-light-hover': '#ea580c',
        
        // Premium Gold
        'premium-light': '#d4af37',    // Bright gold
        'premium-light-hover': '#b45309',
        
        // Alert Red
        'danger-light': '#ef4444',     // Bright red
        'danger-light-hover': '#dc2626',
        
        // Background colors for light mode
        'bg-light': {
          primary: '#ffffff',          // White background
          secondary: '#f9fafb',        // Gray-50 for sections
          card: '#ffffff',             // White cards
          hover: '#f3f4f6',            // Gray-100 for hover states
        },
        
        // Text colors for light mode
        'text-light': {
          primary: '#111827',          // Gray-900 (dark text)
          secondary: '#6b7280',        // Gray-500 (muted text)
          muted: '#9ca3af',            // Gray-400 (very muted)
          inverse: '#ffffff',          // White text on colored backgrounds
        },
        
        // Border colors for light mode
        'border-light': {
          default: '#e5e7eb',          // Gray-200
          strong: '#d1d5db',           // Gray-300
          accent: '#2563eb',           // Blue border
        },
        
        // ====================================================================
        // DARK MODE COLOR PALETTE (Muted, desaturated versions)
        // ====================================================================
        'primary-dark': '#3b82f6',     // Softer blue for dark mode
        'primary-dark-hover': '#60a5fa',
        
        'success-dark': '#34d399',     // Softer green
        'success-dark-hover': '#10b981',
        
        'accent-dark': '#fb923c',      // Softer orange
        'accent-dark-hover': '#f97316',
        
        'premium-dark': '#fbbf24',     // Softer gold
        'premium-dark-hover': '#f59e0b',
        
        'danger-dark': '#f87171',      // Softer red
        'danger-dark-hover': '#ef4444',
        
        // Background colors for dark mode
        'bg-dark': {
          primary: '#030712',          // Gray-950 (very dark)
          secondary: '#111827',        // Gray-900 for sections
          card: '#1f2937',             // Gray-800 for cards
          hover: '#374151',            // Gray-700 for hover states
        },
        
        // Text colors for dark mode
        'text-dark': {
          primary: '#f9fafb',          // Gray-50 (light text)
          secondary: '#d1d5db',        // Gray-300 (muted light text)
          muted: '#9ca3af',            // Gray-400 (very muted)
          inverse: '#111827',          // Dark text on light backgrounds
        },
        
        // Border colors for dark mode
        'border-dark': {
          default: '#374151',          // Gray-700
          strong: '#4b5563',           // Gray-600
          accent: '#3b82f6',           // Blue border
        },
      },
      
      // ====================================================================
      // BACKGROUND IMAGES - DIFFERENT GRIDS FOR LIGHT/DARK
      // ====================================================================
      backgroundImage: {
        // Light mode grid (subtle)
        'grid-light': 
          'linear-gradient(to right, rgb(209 213 219 / 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgb(209 213 219 / 0.15) 1px, transparent 1px)',
        
        // Dark mode grid (more visible)
        'grid-dark': 
          'linear-gradient(to right, rgb(75 85 99 / 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgb(75 85 99 / 0.2) 1px, transparent 1px)',
        
        // Hero gradients for each mode
        'hero-light': 
          'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 1) 50%, rgba(249, 115, 22, 0.05) 100%)',
        
        'hero-dark': 
          'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(3, 7, 18, 1) 50%, rgba(194, 65, 12, 0.1) 100%)',
      },
      
      backgroundSize: {
        'grid': '50px 50px',
      },
      
      // ====================================================================
      // BOX SHADOWS - DIFFERENT FOR LIGHT/DARK
      // ====================================================================
      boxShadow: {
        'card-light': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'elevated-light': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'elevated-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
      },
      scale: {
        '102':'1.02',
      },
    },
  },
  
  plugins: [],
}

export default config