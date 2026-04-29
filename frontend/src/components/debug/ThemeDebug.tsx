'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Monitor, Sun, Moon, RefreshCw } from 'lucide-react'

/**
 * THEME DEBUG COMPONENT
 * 
 * PURPOSE: Debug dark/light mode issues during development
 * 
 * DISPLAYS:
 * - Current theme state from next-themes
 * - System theme preference
 * - HTML element classes
 * - Theme toggle buttons for testing
 * 
 * USAGE: 
 * 1. Add <ThemeDebug /> to any page temporarily
 * 2. Check what theme values are displayed
 * 3. Fix mismatches between expected and actual
 * 4. Remove component before production
 * 
 * LOCATION: Should be placed in a non-critical area
 * (bottom corner, dev-only route, or conditional on dev env)
 */
export default function ThemeDebug() {
 const { theme, resolvedTheme, systemTheme, setTheme } = useTheme()
 const [mounted, setMounted] = useState(false)
 const [htmlClass, setHtmlClass] = useState('')

 // Wait for component to mount to access document
 useEffect(() => {
 setMounted(true)
 setHtmlClass(document.documentElement.className)
 }, [])

 // Update HTML class when theme changes
 useEffect(() => {
 if (mounted) {
 setHtmlClass(document.documentElement.className)
 }
 }, [theme, mounted])

 // Don't render during SSR
 if (!mounted) {
 return (
 <div className="fixed bottom-4 left-4 p-3 surface-card text-white rounded-lg text-xs">
 Loading theme debug...
 </div>
 )
 }

 return (
 <div className="fixed bottom-4 left-4 p-4 surface-card  rounded-lg border border-theme-strong shadow-lg z-50 max-w-xs">
 <div className="space-y-3">
 {/* Header */}
 <div className="flex items-center justify-between">
 <h3 className="font-bold text-sm text-theme-primary">
 Theme Debug
 </h3>
 <button
 onClick={() => window.location.reload()}
 className="p-1 hover:surface-section dark:hover:surface-card rounded"
 title="Refresh page"
 >
 <RefreshCw className="w-3 h-3" />
 </button>
 </div>

 {/* Theme Status */}
 <div className="space-y-2 font-mono text-xs">
 <div className="flex items-center gap-2">
 <Monitor className="w-3 h-3" />
 <span className="text-theme-secondary ">System:</span>
 <span className="font-semibold">{systemTheme || 'none'}</span>
 </div>
 
 <div className="flex items-center gap-2">
 <Sun className="w-3 h-3" />
 <span className="text-theme-secondary ">Theme:</span>
 <span className={`font-bold ${theme === 'dark' ? 'text-primary-light dark:text-primary-dark' : 'text-orange-500'}`}>
 {theme}
 </span>
 </div>
 
 <div className="flex items-center gap-2">
 <Moon className="w-3 h-3" />
 <span className="text-theme-secondary ">Resolved:</span>
 <span className={`font-bold ${resolvedTheme === 'dark' ? 'text-primary-light dark:text-primary-dark' : 'text-orange-500'}`}>
 {resolvedTheme}
 </span>
 </div>
 
 <div className="pt-2 border-t border-theme">
 <div className="text-theme-secondary mb-1">HTML Classes:</div>
 <div className="surface-section p-2 rounded text-wrap break-all">
 {htmlClass || '(none)'}
 </div>
 </div>
 </div>

 {/* Theme Controls */}
 <div className="pt-2 border-t border-theme">
 <div className="text-xs text-theme-secondary mb-2">
 Force Theme:
 </div>
 <div className="flex gap-2">
 {(['light', 'dark', 'system'] as const).map((t) => (
 <button
 key={t}
 onClick={() => setTheme(t)}
 className={`flex-1 py-1.5 text-xs rounded transition-colors ${
 theme === t
 ? 'bg-trust-blue text-white'
 : 'surface-section text-theme-secondary hover:surface-section dark:hover:surface-section'
 }`}
 >
 {t}
 </button>
 ))}
 </div>
 </div>

 {/* Status Indicator */}
 <div className={`p-2 rounded text-center text-xs font-medium ${
 resolvedTheme === theme
 ? 'bg-success-green/20 text-success-green-dark dark:text-success-green-light'
 : 'bg-alert-red/20 text-alert-red-dark dark:text-alert-red-light'
 }`}>
 {resolvedTheme === theme 
 ? '✅ Theme sync OK' 
 : '⚠️ Theme mismatch'}
 </div>
 </div>
 </div>
 )
}

/**
 * ALTERNATIVE USAGE:
 * 
 * 1. Environment-based rendering:
 * {process.env.NODE_ENV === 'development' && <ThemeDebug />}
 * 
 * 2. Keyboard shortcut toggle:
 * Add useEffect to show/hide on Ctrl+Shift+D
 * 
 * 3. Route-based: /debug/theme
 */