import type { Metadata, Viewport } from 'next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Header } from '@/components/navigation/Header'
import { Footer } from '@/components/navigation/Footer'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getServerSideURL } from '@/utilities/getURL'
import { cookies, headers } from 'next/headers'
import { themeCookieKey } from '@/providers/Theme/shared'
import { getLanguage } from '@/config/languages'
import { LocaleProvider } from '@/components/i18n/LocaleProvider'
import { EpubtransAssistant } from '@/components/assistant/EpubtransAssistant'
import { getSiteSettings } from '@/lib/content'
import '@/styles/index.css'
export async function generateViewport(): Promise<Viewport> {
  const dark = (await cookies()).get(themeCookieKey)?.value === 'dark'
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    interactiveWidget: 'resizes-content',
    themeColor: dark ? '#0e1b19' : '#f4f2eb',
  }
}
export const dynamic = 'force-dynamic'
export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get(themeCookieKey)?.value === 'dark' ? 'dark' : 'light'
  const locale = getLanguage((await headers()).get('x-epubtrans-language') || 'en')?.code || 'en'
  const settings = await getSiteSettings()
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EPUBTRANS',
    url: getServerSideURL(),
    ...(settings.contactDetailsApproved === true && settings.email ? { email: settings.email } : {}),
    ...(settings.contactDetailsApproved === true && settings.phone ? { telephone: settings.phone } : {}),
  }
  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      lang="en"
      dir="ltr"
      data-theme={theme}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
      </head>
      <body className="et-site">
        <Providers initialTheme={theme}>
          <LocaleProvider locale={locale}>
            <a className="et-skip" href="#main-content">
              Skip to main content
            </a>
            <Header />
            <div id="main-content" tabIndex={-1}>
              {children}
            </div>
            <Footer />
            <EpubtransAssistant
              email={settings.contactDetailsApproved === true ? settings.email || '' : ''}
              phone={settings.contactDetailsApproved === true ? settings.phone || '' : ''}
            />
          </LocaleProvider>
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organization).replace(/</g, '\\u003c'),
          }}
        />
      </body>
    </html>
  )
}
export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: { default: 'EPUBTRANS', template: '%s | EPUBTRANS' },
  description:
    'Professional publishing, translation, localization, multimedia, and accessibility services.',
  icons: {
    icon: [
      { url: '/icons/epubtrans.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/icons/epubtrans-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: { url: '/icons/epubtrans-180.png', sizes: '180x180', type: 'image/png' },
  },
  openGraph: {
    type: 'website',
    siteName: 'EPUBTRANS',
    title: { default: 'EPUBTRANS', template: '%s | EPUBTRANS' },
    description: 'Publishing, language and digital content services.',
  },
  twitter: {
    card: 'summary',
    title: 'EPUBTRANS',
    description: 'Publishing, language and digital content services.',
  },
}
