// ============================================================================
// TAILWIND CONFIG — ELECTRIC BLUE + ORANGE DESIGN SYSTEM
// ============================================================================
import type { Config } from 'tailwindcss'

const config: Config = {
 content: [
 './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
 './src/components/**/*.{js,ts,jsx,tsx,mdx}',
 './src/app/**/*.{js,ts,jsx,tsx,mdx}',
 './app/**/*.{js,ts,jsx,tsx,mdx}',
 ],
 darkMode: 'class',
 theme: {
 extend: {
 colors: {
 // ── BRAND BLUE (Trust · Action · Booking) ──────────────────────────
 'primary-light': '#2563eb', // light mode blue
 'primary-light-hover': '#1d4ed8',
 'primary-dark': '#3b82f6', // dark mode blue
 'primary-dark-hover': '#60a5fa',

 // ── BRAND ORANGE (Urgency · Excitement · Featured) ─────────────────
 'accent-light': '#f97316', // light mode orange
 'accent-light-hover': '#ea580c',
 'accent-dark': '#fb923c', // dark mode orange
 'accent-dark-hover': '#f97316',

 // ── SEMANTIC DANGER (red — errors, bans, cancelled) ────────────────
 'danger-light': '#ef4444',
 'danger-light-hover': '#dc2626',
 'danger-dark': '#f87171',
 'danger-dark-hover': '#ef4444',

 // ── SEMANTIC WARNING (yellow — pending, caution) ───────────────────
 'warning-light': '#f59e0b',
 'warning-light-hover': '#d97706',
 'warning-dark': '#fbbf24',
 'warning-dark-hover': '#f59e0b',

 // ── SEMANTIC SUCCESS (green — completed, verified) ─────────────────
 'success-light': '#16a34a',
 'success-light-hover': '#15803d',
 'success-dark': '#22c55e',
 'success-dark-hover': '#16a34a',

 // ── BACKGROUND ELEVATION ───────────────────────────────────────────
 // Light: blueish-white palette / Dark: deep navy palette
 'bg-base-light': '#f0f5ff', // page bg
 'bg-base-dark': '#040d1e',
 'bg-section-light': '#e4ecff', // alternating sections
 'bg-section-dark': '#071428',
 'bg-card-light': '#ffffff', // cards, panels, sidebars
 'bg-card-dark': '#0c1f3d',
 'bg-paper-light': '#ffffff', // modals, drawers, tickets
 'bg-paper-dark': '#122850',
 'bg-hover-dark': '#1a3566', // interactive hover (dark only)

 // ── TEXT ───────────────────────────────────────────────────────────
 'text-primary-light': '#0a1628',
 'text-primary-dark': '#dbeafe',
 'text-secondary-light': '#3d5a8a',
 'text-secondary-dark': '#6ea6e8',
 'text-muted-light': '#7a96c0',
 'text-muted-dark': '#2d5a96',

 // ── BORDERS ────────────────────────────────────────────────────────
 'border-default-light': '#c8d8f8',
 'border-default-dark': '#112240',
 'border-strong-light': '#a0b8f0',
 'border-strong-dark': '#1a3566',

 // Keep gray scale for any remaining utility needs (Tailwind defaults)
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
 },

 backgroundImage: {
 'hero-light': 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, #f0f5ff 50%, rgba(249,115,22,0.06) 100%)',
 'hero-dark': 'linear-gradient(135deg, rgba(30,64,175,0.12) 0%, #040d1e 50%, rgba(194,65,12,0.12) 100%)',
 'grid-light': 'linear-gradient(to right, rgb(200 216 248 / 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgb(200 216 248 / 0.2) 1px, transparent 1px)',
 'grid-dark': 'linear-gradient(to right, rgb(17 34 64 / 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgb(17 34 64 / 0.4) 1px, transparent 1px)',
 },

 backgroundSize: {
 grid: '50px 50px',
 },

 boxShadow: {
 'card-light': '0 1px 3px 0 rgba(37,99,235,0.06), 0 1px 2px -1px rgba(37,99,235,0.04)',
 'card-dark': '0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)',
 'elevated-light': '0 10px 15px -3px rgba(37,99,235,0.08), 0 4px 6px -4px rgba(37,99,235,0.06)',
 'elevated-dark': '0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -4px rgba(0,0,0,0.4)',
 'pop-light': '0 20px 25px -5px rgba(37,99,235,0.1), 0 8px 10px -6px rgba(37,99,235,0.08)',
 'pop-dark': '0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)',
 },

 scale: {
 '102': '1.02',
 },
 },
 },
 plugins: [],
}

export default config