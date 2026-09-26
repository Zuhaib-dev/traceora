import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://traceora-web.vercel.app'),
  title: 'Traceora | Zero-Config Full-Stack Runtime Intelligence',
  description: 'Traceora turns scattered logs into one causally-linked timeline — from a React interaction to the exact database query that followed it.',
  keywords: ['traceora', 'react', 'express', 'tracing', 'full-stack', 'devtools', 'profiling', 'runtime intelligence'],
  authors: [{ name: 'Zuhaib Rashid', url: 'https://zuhaibrashid.com' }],
  creator: 'Zuhaib Rashid',
  openGraph: {
    title: 'Traceora | Zero-Config Full-Stack Runtime Intelligence',
    description: 'Traceora turns scattered logs into one causally-linked timeline.',
    url: 'https://traceora-web.vercel.app',
    siteName: 'Traceora',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og.jpg',
        width: 1920,
        height: 1080,
        alt: 'Traceora — Zero-Config Full-Stack Runtime Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Traceora | Zero-Config Full-Stack Runtime Intelligence',
    description: 'Zero-config full-stack runtime intelligence.',
    creator: '@xuhaib_x9',
    images: ['/og.jpg'],
  },
  verification: {
    google: 'terZRkP5xAisMxUTVWZ_rW6MXSuOeuAFITryD0CBDxA',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#099268',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Traceora',
    url: 'https://traceora-web.vercel.app',
    operatingSystem: 'Any',
    applicationCategory: 'DeveloperApplication',
    author: {
      '@type': 'Person',
      name: 'Zuhaib Rashid',
      url: 'https://zuhaibrashid.com'
    },
    description: 'Zero-Config Full-Stack Runtime Intelligence for React and Express.',
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
