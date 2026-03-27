'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/types';
import { pdfjs } from 'react-pdf';

import FlipReader from './FlipReader';
import ScrollReader from './ScrollReader';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Loader2, ExternalLink } from 'lucide-react';

// Setup PDF worker
// Use a fixed version matching the package.json to avoid errors
// "react-pdf": "^10.2.0" -> pdfjs-dist used internally.
// We'll use unkg or similar CDN for simplicity in Next.js App Router
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReaderProps {
    book: Book;
}

export default function Reader({ book }: ReaderProps) {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);

    // Simple Mobile Detection (Tailwind 'md' breakpoint is 768px)
    // We want Tablet (iPad) to be FlipReader, so we treat < 768px as Mobile probably?
    // User asked for "Tablet Split View". iPad Portrait is 768px+.
    // So < 768px = Mobile Scroll. >= 768px = Desktop/Tablet Flip.
    useEffect(() => {
        setMounted(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!mounted) return null; // Prevent hydration mismatch

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#333]">
            {/* Viewer Header */}
            <header className="flex-none bg-[#111] text-white p-3 flex items-center justify-between z-10 shadow-md">
                <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    <span className="hidden sm:inline text-sm font-medium">Library</span>
                </Link>

                <h1 className="text-sm md:text-base font-bold truncate max-w-[50vw] px-2 text-center">
                    {book.title}
                </h1>

                <div className="flex items-center">
                    {book.link_url ? (
                        <a
                            href={book.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
                        >
                            <span className="hidden sm:inline">関連リンク</span>
                            <ExternalLink size={14} />
                            
                            {/* Hover QR Code (Desktop only) */}
                            <div className="absolute hidden group-hover:block top-full right-0 mt-2 p-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(book.link_url)}`}
                                    alt="QR Code"
                                    className="w-24 h-24 sm:w-32 sm:h-32"
                                />
                                <div className="text-center text-[10px] text-gray-500 mt-1">スマホでスキャン</div>
                            </div>
                        </a>
                    ) : (
                        <div className="w-8" />
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-grow relative w-full h-full overflow-hidden">
                {book.file_url ? (
                    isMobile ? (
                        <ScrollReader url={book.file_url} bookId={book.id} skipFirstPage={book.skip_first_page} />
                    ) : (
                        <FlipReader url={book.file_url} bookId={book.id} skipFirstPage={book.skip_first_page} />
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/50">
                        <BookOpen size={48} className="mb-4 opacity-50" />
                        <p>Book file is missing.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
