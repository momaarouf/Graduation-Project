import React from 'react'

export default function Footer() {
 return (
 <footer className="pt-6 pb-24 md:pb-6 surface-section border-t border-[#e4ecff] dark:border-[#071428]" aria-label="Footer">
 <div className="container-safe mx-auto px-4 text-center">
 <p className="text-sm text-theme-muted ">
 © {new Date().getFullYear()} Tourongo Travel Marketplace
 </p>
 </div>
 </footer>
 )
}
