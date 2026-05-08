'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`p-1.5 rounded-lg opacity-50 ${className}`}>
        <Moon className="w-4 h-4 text-theme-muted" />
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-1.5 rounded-lg hover:surface-section transition-colors ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-theme-muted" />
      ) : (
        <Moon className="w-4 h-4 text-theme-muted" />
      )}
    </button>
  )
}
