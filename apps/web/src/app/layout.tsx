import './globals.css';
import type { Metadata } from 'next';
import { Montserrat, Inter } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'saldocasa — controle financeiro doméstico',
  description: 'Organize as finanças da casa com simplicidade. Entradas, saídas, categorias, orçamentos e relatórios.',
  applicationName: 'saldocasa',
  themeColor: '#0f1a2e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'rounded-xl border border-slate-200 bg-white text-slate-900 shadow-elevated',
            },
          }}
        />
      </body>
    </html>
  );
}
