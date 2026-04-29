'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
 const pathname = usePathname()
 
 // Hide footer on all dashboard routes (including messages)
 if (pathname?.startsWith('/dashboard')) {
 return null
 }
 
 return <Footer />
}
