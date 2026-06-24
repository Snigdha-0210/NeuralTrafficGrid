import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { ToastProvider } from '@/components/toast'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Neural Traffic Grid — AI Traffic Intelligence',
  description:
    'AI-driven traffic signal optimization platform using ANN, Fuzzy Logic, and Particle Swarm Optimization.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#070b11',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ background: '#070b11' }}
    >
      <body className="font-sans antialiased" style={{ background: '#070b11' }}>
        <ToastProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-0 flex-1 md:ml-[220px]">{children}</main>
          </div>
        </ToastProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
