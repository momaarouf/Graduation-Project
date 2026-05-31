import React from 'react'

export default function Footer() {
 return (
 <footer className="pt-6 pb-24 md:pb-6 surface-section border-t border-[#c8d8f8] dark:border-[#1a3566]" aria-label="Footer">
 <div className="container-safe mx-auto px-4 text-center">
 <p className="text-sm text-theme-muted ">
 © {new Date().getFullYear()} SafariHub Travel Marketplace
 </p>
 </div>
 </footer>
 )
}
