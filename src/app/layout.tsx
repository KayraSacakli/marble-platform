import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marble Platform',
  description: 'Premium Marble Manufacturer & Exporter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
