import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Montserrat, Inter, Fraunces } from 'next/font/google';
import { Toaster } from 'sonner';

const display = Montserrat({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500'],
  style: ['italic', 'normal'],
});

export const metadata: Metadata = {
  title: {
    default: 'saldocasa — controle financeiro doméstico',
    template: '%s · saldocasa',
  },
  description:
    'Organize as finanças da casa com simplicidade. Entradas, saídas, categorias, orçamentos e relatórios.',
  applicationName: 'saldocasa',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    title: 'saldocasa',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'saldocasa',
    description: 'Controle financeiro doméstico simples e seguro.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f1a2e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast:
                'rounded-xl border border-slate-200 bg-white text-slate-900 shadow-elevated',
            },
          }}
        />
      </body>
    </html>
  );
}
