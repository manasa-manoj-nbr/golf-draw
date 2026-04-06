import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import '@/styles/globals.css'
import { ToastContainer } from '@/components/ui'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    default: 'GolfDraw - Play. Win. Give Back.',
    template: '%s | GolfDraw',
  },
  description: 'A subscription-based golf platform combining performance tracking, monthly prize draws, and charitable giving. Your golf scores could win big and change lives.',
  keywords: ['golf', 'charity', 'prize draw', 'subscription', 'stableford', 'golf scores'],
  authors: [{ name: 'GolfDraw' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GolfDraw',
    title: 'GolfDraw - Play. Win. Give Back.',
    description: 'Your golf scores could win big and change lives.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GolfDraw - Play. Win. Give Back.',
    description: 'Your golf scores could win big and change lives.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-bauhaus-white font-sans antialiased">
        {children}
        <ToastContainer />
        <Analytics />
      </body>
    </html>
  )
}
