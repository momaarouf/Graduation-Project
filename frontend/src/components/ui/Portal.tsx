'use client'

import { useEffect, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
 children: ReactNode
}

/**
 * Portal component to render children outside the current DOM hierarchy (at document.body level).
 * This solves z-index and stacking context issues in deeply nested components.
 */
export default function Portal({ children }: PortalProps) {
 const [mounted, setMounted] = useState(false)

 useEffect(() => {
 setMounted(true)
 return () => setMounted(false)
 }, [])

 // Only render on client after mounting
 if (!mounted || typeof document === 'undefined') {
 return null
 }

 return createPortal(children, document.body)
}
