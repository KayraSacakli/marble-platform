import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Marble Platform',
    template: '%s | Marble Platform',
  },
  description: 'Premium natural marble collection.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
