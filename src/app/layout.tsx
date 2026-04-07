import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Awesome Adventure Library',
  description: 'A web library for adventurous readers.',
};

// Inline polyfill script that runs BEFORE React/Next.js bundles load.
// This is critical for older iPad Safari (< 17.4) which lacks Promise.withResolvers,
// an API that React 19 uses internally during hydration.
const polyfillScript = `
(function() {
  // Promise.withResolvers — Safari < 17.4, iOS < 17.4
  if (typeof Promise.withResolvers === 'undefined') {
    Promise.withResolvers = function() {
      var resolve, reject;
      var promise = new Promise(function(res, rej) {
        resolve = res;
        reject = rej;
      });
      return { promise: promise, resolve: resolve, reject: reject };
    };
  }

  // URL.parse — Safari < 17.0, iOS < 17.0
  if (typeof URL !== 'undefined' && typeof URL.parse === 'undefined') {
    URL.parse = function(url, base) {
      try {
        return new URL(url, base);
      } catch (e) {
        return null;
      }
    };
  }

  // structuredClone — Safari < 15.4, iOS < 15.4
  if (typeof globalThis.structuredClone === 'undefined') {
    globalThis.structuredClone = function(val) {
      return JSON.parse(JSON.stringify(val));
    };
  }

  // Object.hasOwn — Safari < 15.4, iOS < 15.4
  if (typeof Object.hasOwn === 'undefined') {
    Object.hasOwn = function(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };
  }

  // Array.prototype.at — Safari < 15.4, iOS < 15.4
  if (!Array.prototype.at) {
    Array.prototype.at = function(n) {
      n = Math.trunc(n) || 0;
      if (n < 0) n += this.length;
      if (n < 0 || n >= this.length) return undefined;
      return this[n];
    };
  }

  // String.prototype.at — Safari < 15.4, iOS < 15.4
  if (!String.prototype.at) {
    String.prototype.at = function(n) {
      n = Math.trunc(n) || 0;
      if (n < 0) n += this.length;
      if (n < 0 || n >= this.length) return undefined;
      return this[n];
    };
  }

  // globalThis — very old browsers
  if (typeof globalThis === 'undefined') {
    (function() {
      if (typeof self !== 'undefined') { self.globalThis = self; }
      else if (typeof window !== 'undefined') { window.globalThis = window; }
    })();
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <script dangerouslySetInnerHTML={{ __html: polyfillScript }} />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#FDFBF7]`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
