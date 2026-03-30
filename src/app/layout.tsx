import type { Metadata } from 'next';
import { Public_Sans } from 'next/font/google';
import './globals.css';

const publicSans = Public_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Futbol Power — El portal del fútbol',
  description:
    'Las noticias más completas del fútbol español y argentino en un solo lugar',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${publicSans.variable} antialiased bg-obsidian text-bone`}>
        {children}
      </body>
    </html>
  );
}
