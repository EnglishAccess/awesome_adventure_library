'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { Loader2 } from 'lucide-react';

interface ScrollReaderProps {
    url: string;
    bookId: string;
}

export default function ScrollReader({ url, bookId }: ScrollReaderProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
        restoreProgress(numPages);
    }

    // Restore progress from local storage
    const restoreProgress = (total: number) => {
        const saved = localStorage.getItem(`progress_${bookId}`);
        if (saved) {
            const pageNum = parseInt(saved, 10);
            if (pageNum > 1 && pageNum <= total) {
                // Scroll to that page element
                const element = document.getElementById(`page_${pageNum}`);
                element?.scrollIntoView({ behavior: 'auto' });
            }
        }
    };

    // Simple intersection observer to save progress could be added here
    // For simplicity MVP: Save progress when scrolling stops? Or just simple click?
    // Let's implement basic "save valid visible page" later if needed.

    return (
        <div className="relative w-full h-full overflow-y-auto bg-[#2a2a2a] p-4" ref={containerRef}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                    <Loader2 className="animate-spin mb-2" />
                    <span className="ml-2">Loading Document...</span>
                </div>
            )}

            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex flex-col items-center gap-4"
                loading={null}
            >
                {Array.from(new Array(numPages), (el, index) => (
                    <div key={`page_${index + 1}`} id={`page_${index + 1}`} className="shadow-lg">
                        <Page
                            pageNumber={index + 1}
                            width={Math.min(window.innerWidth - 32, 600)} // Responsive fit
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            loading={
                                <div className="w-full h-[50vh] bg-white/5 animate-pulse rounded" />
                            }
                        />
                        <div className="text-center text-xs text-white/30 mt-1">
                            {index + 1} / {numPages}
                        </div>
                    </div>
                ))}
            </Document>
        </div>
    );
}
