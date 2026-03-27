'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2 } from 'lucide-react';

interface ScrollReaderProps {
    url: string;
    bookId: string;
    skipFirstPage?: boolean;
}

export default function ScrollReader({ url, bookId, skipFirstPage }: ScrollReaderProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [pageWidth, setPageWidth] = useState<number>(0);
    const [pageAspectRatio, setPageAspectRatio] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Detect PDF page aspect ratio from the first page
    useEffect(() => {
        let cancelled = false;
        async function detectPageSize() {
            try {
                const loadingTask = pdfjs.getDocument(url);
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1 });
                if (!cancelled) {
                    setPageAspectRatio(viewport.width / viewport.height);
                }
            } catch (e) {
                console.error('Failed to detect PDF page size:', e);
                if (!cancelled) setPageAspectRatio(0.707); // Fallback A4
            }
        }
        detectPageSize();
        return () => { cancelled = true; };
    }, [url]);

    // Calculate page width based on screen and aspect ratio
    useEffect(() => {
        if (pageAspectRatio === null) return;

        const updateWidth = () => {
            const screenW = window.innerWidth;
            if (pageAspectRatio >= 1) {
                // Landscape: allow wider display
                setPageWidth(Math.min(screenW - 32, 900));
            } else {
                // Portrait: narrower
                setPageWidth(Math.min(screenW - 32, 600));
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [pageAspectRatio]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
        restoreProgress(numPages);
    }

    const restoreProgress = (total: number) => {
        const saved = localStorage.getItem(`progress_${bookId}`);
        if (saved) {
            const pageNum = parseInt(saved, 10);
            if (pageNum > 1 && pageNum <= total) {
                const element = document.getElementById(`page_${pageNum}`);
                element?.scrollIntoView({ behavior: 'auto' });
            }
        }
    };

    if (!pageWidth) {
        return (
            <div className="relative w-full h-full flex items-center justify-center bg-[#2a2a2a]">
                <div className="flex items-center text-white/50">
                    <Loader2 className="animate-spin mb-2" />
                    <span className="ml-2">Detecting page size...</span>
                </div>
            </div>
        );
    }

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
                {(() => {
                    const pagesArray = Array.from(new Array(numPages), (el, index) => index + 1);
                    const pagesToRender = skipFirstPage && pagesArray.length > 1 ? pagesArray.slice(1) : pagesArray;

                    return pagesToRender.map((pageNum) => (
                        <div key={`page_${pageNum}`} id={`page_${pageNum}`} className="shadow-lg">
                            <Page
                                pageNumber={pageNum}
                                width={pageWidth}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                loading={
                                    <div className="w-full h-[50vh] bg-white/5 animate-pulse rounded" />
                                }
                            />
                            <div className="text-center text-xs text-white/30 mt-1">
                                {pageNum} / {numPages}
                            </div>
                        </div>
                    ));
                })()}
            </Document>
        </div>
    );
}
