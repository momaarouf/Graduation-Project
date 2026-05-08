import { Metadata } from 'next'

export const metadata: Metadata = {
 title: 'Sign In | SafariHub - Travel Marketplace',
 description: 'Sign in to your SafariHub account to manage bookings, messages, and more.',
 robots: {
 index: false,
 follow: false,
 },
 openGraph: {
 title: 'Sign In to SafariHub',
 description: 'Access your travel account',
 images: ['/images/og/auth-og.jpg'],
 }
}

export default function LoginLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return <>{children}</>
}
