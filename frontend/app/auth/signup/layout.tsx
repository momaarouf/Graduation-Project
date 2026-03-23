import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Create Account | SafariHub - Travel Marketplace',
    description: 'Join SafariHub to discover authentic travel experiences with verified guides.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
