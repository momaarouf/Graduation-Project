// ============================================================================
// THEME PROVIDER - DUAL THEME MANAGER
// ============================================================================
// LOCATION: /frontend/src/lib/providers/ThemeProvider.tsx
// 
// PURPOSE: Manage theme switching between light and dark modes
// 
// HOW IT WORKS:
// 1. Adds/removes .dark class on <html> element
// 2. Persists user preference in localStorage
// 3. Respects system preference
// 4. Prevents hydration mismatch
// ============================================================================

'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ 
 children, 
 ...props 
}: ThemeProviderProps) {
 return (
 <NextThemesProvider
 // ============================================
 // CRITICAL SETTINGS - DO NOT CHANGE
 // ============================================
 
 // Use class-based dark mode (Tailwind expects .dark class)
 attribute="class"
 
 // Default to system preference
 defaultTheme="system"
 
 // Enable system preference detection
 enableSystem={true}
 
 // Set CSS color-scheme property (affects scrollbars, form controls)
 enableColorScheme={true}
 
 // Smooth transitions between themes
 disableTransitionOnChange={false}
 
 // Custom localStorage key for persistence
 storageKey="safaribub-theme"
 
 // ============================================
 // Pass any additional props
 // ============================================
 {...props}
 >
 {children}
 </NextThemesProvider>
 )
}

// ============================================================================
// THEME PROVIDER CONFIGURATION EXPLANATION:
// ============================================================================
// 
// attribute="class":
// - Adds .dark class to <html> element when in dark mode
// - Removes .dark class when in light mode
// - Tailwind classes with dark: prefix are activated by this
//
// enableSystem={true}:
// - Detects OS-level dark mode preference
// - Automatically switches to dark mode if OS prefers it
// - User can override this preference
//
// enableColorScheme={true}:
// - Sets CSS color-scheme: dark/light property
// - Affects browser UI elements (scrollbars, form controls)
// - Important for consistent dark mode experience
//
// storageKey="safaribub-theme":
// - Remembers user's theme preference in localStorage
// - Persists across browser sessions
// - Key can be changed if needed
//
// disableTransitionOnChange={false}:
// - Enables smooth transitions between themes
// - Colors fade instead of instantly switching
// - Better user experience
// ============================================================================