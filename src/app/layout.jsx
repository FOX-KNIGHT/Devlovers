import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProvider } from '@/lib/i18n/context';
import { Toaster } from 'sonner';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://devlovers.com'),
  title: 'Devlovers | The Premier Global Hackathon & Developer Hub',
  description: 'Discover high-stakes hackathons, build elite squads, and ship transformative software with AI-augmented tools.',
  keywords: ['hackathon', 'developer', 'software engineering', 'ai', 'coding competitions'],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#06080F' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-void)] text-[hsl(var(--foreground))] antialiased selection:bg-[#00F5FF]/30 selection:text-[#00F5FF]">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            {children}
            <Toaster richColors position="top-right" theme="dark" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
