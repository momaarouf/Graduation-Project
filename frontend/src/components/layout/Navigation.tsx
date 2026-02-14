// ============================================================================
// NAVIGATION - DUAL THEME COMPONENT
// ============================================================================
// LOCATION: /frontend/src/components/layout/Navigation.tsx
// 
// PURPOSE: Global navigation with theme toggle
// 
// IMPORTANT: Every element has separate light/dark colors
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Menu, X, Globe, Moon, Sun } from 'lucide-react'

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { resolvedTheme, setTheme } = useTheme()

    // Prevent hydration mismatch by only rendering theme-dependent content after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        // Use resolvedTheme to get the actual applied theme ('dark' or 'light')
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }

    const NAV_LINKS = [
        { href: '/tours', label: 'Tours' },
        { href: '/guides/onboarding', label: 'Guides' },
        { href: '/how-it-works', label: 'How It Works' },
    ] as const

    return (
        <nav
            className="fixed top-0 w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
        >
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">

                    {/* 
            ============================================
            LOGO - DUAL THEME
            ============================================
          */}
                    <Link href="/" className="flex items-center gap-2">
                        {/* Logo icon with dual colors */}
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>

                        {/* Logo text with dual colors */}
                        <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden xs:block">
                            SafariHub
                        </span>
                    </Link>

                    {/* 
            ============================================
            DESKTOP NAVIGATION - DUAL THEME
            ============================================
          */}
                    <div className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">

                        {/* Navigation links with dual colors */}
                        <div className="flex space-x-4 lg:space-x-6">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* 
              ============================================
              THEME TOGGLE BUTTON - DUAL THEME
              ============================================
              Prevents hydration mismatch by rendering placeholder until mounted
            */}
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {!mounted ? (
                                // Placeholder during SSR to prevent hydration mismatch
                                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                            ) : resolvedTheme === 'dark' ? (
                                // Sun icon for dark mode (click to go light)
                                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                                // Moon icon for light mode (click to go dark)
                                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                            )}
                        </button>

                        {/* 
              ============================================
              AUTH LINKS - DUAL THEME
              ============================================
            */}
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/auth/login"
                                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="bg-blue-600 dark:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    {/* 
            ============================================
            MOBILE MENU BUTTONS - DUAL THEME
            ============================================
          */}
                    <div className="flex items-center gap-2 md:hidden">
                        {/* Theme toggle for mobile */}
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Toggle theme"
                        >
                            {!mounted ? (
                                // Placeholder during SSR to prevent hydration mismatch
                                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            ) : resolvedTheme === 'dark' ? (
                                // Sun icon for dark mode (click to go light)
                                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                                // Moon icon for light mode (click to go dark)
                                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            )}
                        </button>

                        {/* Menu toggle button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* 
          ============================================
          MOBILE MENU - DUAL THEME
          ============================================
        */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-800 pb-3">
                        <div className="pt-2 space-y-1">
                            {/* Mobile navigation links */}
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile auth links */}
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
                                <Link
                                    href="/auth/login"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="block px-3 py-2 rounded-lg text-base font-medium bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-center"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}