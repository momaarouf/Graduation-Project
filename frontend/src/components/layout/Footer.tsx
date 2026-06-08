import React from 'react'

export default function Footer() {
 return (
 <footer className="pt-6 pb-20 md:pb-6 surface-section" aria-label="Footer">
 <div className="container-safe mx-auto px-4 text-center">
 <p className="text-sm text-theme-muted ">
 © {new Date().getFullYear()} Tourongo Travel Marketplace
 </p>
 </div>
 </footer>
 )
}
