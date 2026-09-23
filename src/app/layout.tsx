import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Premium Turkish Marble',
    template: '%s | Premium Turkish Marble',
  },
  description: 'Premium Marble Manufacturer & Exporter',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
