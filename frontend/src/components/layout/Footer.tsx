import React from 'react'

export default function Footer() {
  return (
    <footer className="py-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800" aria-label="Footer">
      <div className="container-safe mx-auto px-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} SafariHub Travel Marketplace
        </p>
      </div>
    </footer>
  )
}
