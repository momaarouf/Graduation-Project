'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')
  const bottomPadding = isAuthPage ? 'pb-6' : 'pb-20 md:pb-6'

  return (
    <footer className={`pt-6 ${bottomPadding} surface-section`} aria-label="Footer">
      <div className="container-safe mx-auto px-4 text-center">
        <p className="text-sm text-theme-muted mb-2">
          © {new Date().getFullYear()} Tourongo Travel Marketplace
        </p>
        <p className="text-xs text-theme-muted flex items-center justify-center gap-1">
          Designed and developed by Mohamad Maarouf. 
          <a 
            href="https://momaarouf.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-light dark:text-primary-dark hover:underline ml-1"
          >
            momaarouf.dev
          </a>
        </p>
      </div>
    </footer>
  )
}
