import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Polyfill from '@/components/Polyfill';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Awesome Adventure Library',
  description: 'A web library for adventurous readers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#FDFBF7]`}>
        <Polyfill />
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
