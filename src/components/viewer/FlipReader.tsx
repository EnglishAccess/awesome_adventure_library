'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface FlipReaderProps {
    url: string;
    bookId: string;
    skipFirstPage?: boolean;
}

const FlipPage = forwardRef<HTMLDivElement, any>((props, ref) => {
    return (
        <div ref={ref} className="bg-white overflow-hidden" style={{ backgroundColor: '#fff' }}>
            {props.children}
        </div>
    );
});
FlipPage.displayName = 'FlipPage';

export default function FlipReader({ url, bookId, skipFirstPage }: FlipReaderProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const flipBookRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const [pageAspectRatio, setPageAspectRatio] = useState<number | null>(null);

    // Step 1: Detect actual PDF page aspect ratio
    useEffect(() => {
        let cancelled = false;
        async function detectPageSize() {
            try {
                const pdf = await pdfjs.getDocument(url).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1 });
                if (!cancelled) {
                    setPageAspectRatio(viewport.width / viewport.height);
                }
            } catch (e) {
                console.error('Failed to detect PDF page size:', e);
                if (!cancelled) setPageAspectRatio(0.707);
            }
        }
        detectPageSize();
        return () => { cancelled = true; };
    }, [url]);

    // Step 2: Calculate dimensions from the container's actual rendered size
    useEffect(() => {
        if (pageAspectRatio === null) return;

        const calculateDim = () => {
            // Measure the actual container element, not window
            const container = containerRef.current;
            if (!container) return;

            const containerW = container.clientWidth;
            const containerH = container.clientHeight;

            // Each page = half the container width (2-page spread)
            // Use 0.48 to leave a small buffer for shadows/borders
            const maxW = Math.floor(containerW * 0.48);
            const maxH = Math.floor(containerH * 0.95);

            let pageW: number;
            let pageH: number;

            // Fit by height, then clamp to maxW
            pageH = maxH;
            pageW = pageH * pageAspectRatio;

            if (pageW > maxW) {
                pageW = maxW;
                pageH = pageW / pageAspectRatio;
            }

            setDimensions({
                width: Math.floor(pageW),
                height: Math.floor(pageH),
            });
        };

        // Small delay to ensure container is measured after layout
        const timer = setTimeout(calculateDim, 50);
        window.addEventListener('resize', calculateDim);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateDim);
        };
    }, [pageAspectRatio]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);

        const saved = localStorage.getItem(`progress_${bookId}`);
        if (saved && flipBookRef.current) {
            const p = parseInt(saved, 10);
            setTimeout(() => {
                try {
                    flipBookRef.current.pageFlip().flip(p - 1);
                } catch (e) { console.log(e); }
            }, 500);
        }
    }

    const onFlip = (e: any) => {
        const pageIndex = e.data;
        setCurrentPage(pageIndex);
        localStorage.setItem(`progress_${bookId}`, (pageIndex + 1).toString());
    };

    const pagesArray = Array.from(new Array(numPages), (_, i) => i + 1);
    const pagesToRender = skipFirstPage && pagesArray.length > 1 ? pagesArray.slice(1) : pagesArray;

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center bg-[#333] overflow-hidden"
        >
            {/* Loading overlay */}
            {(!dimensions || loading) && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50 z-20 bg-[#333]">
                    <Loader2 className="animate-spin mr-2" />
                    <span>{!dimensions ? 'Detecting page size...' : 'Loading Book...'}</span>
                </div>
            )}

            {/* Navigation buttons */}
            {dimensions && !loading && (
                <>
                    <button
                        className="absolute left-2 z-10 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                        onClick={() => flipBookRef.current?.pageFlip().flipPrev()}
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <button
                        className="absolute right-2 z-10 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                        onClick={() => flipBookRef.current?.pageFlip().flipNext()}
                    >
                        <ChevronRight size={28} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/50 text-sm bg-black/20 px-4 py-1 rounded-full pointer-events-none z-10">
                        Page {currentPage + 1} / {numPages}
                    </div>
                </>
            )}

            {/* FlipBook — only render once dimensions are known */}
            {dimensions && (
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={null}
                >
                    <HTMLFlipBook
                        width={dimensions.width}
                        height={dimensions.height}
                        size="fixed"
                        minWidth={100}
                        maxWidth={2000}
                        minHeight={100}
                        maxHeight={2000}
                        maxShadowOpacity={0.4}
                        showCover={true}
                        mobileScrollSupport={false}
                        ref={flipBookRef}
                        onFlip={onFlip}
                        className="shadow-2xl"
                        style={{}}
                        startPage={0}
                        drawShadow={true}
                        flippingTime={800}
                        usePortrait={false}
                        startZIndex={0}
                        autoSize={false}
                        clickEventForward={true}
                        useMouseEvents={true}
                        swipeDistance={30}
                        showPageCorners={true}
                        disableFlipByClick={false}
                    >
                        {pagesToRender.map((pageNum, renderIndex) => (
                            <FlipPage key={renderIndex}>
                                <Page
                                    pageNumber={pageNum}
                                    width={dimensions.width}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    loading={
                                        <div
                                            className="bg-white flex items-center justify-center text-gray-300"
                                            style={{ width: dimensions.width, height: dimensions.height }}
                                        >
                                            <Loader2 className="animate-spin" />
                                        </div>
                                    }
                                />
                                <div className={`absolute bottom-2 text-[10px] text-gray-400 font-mono w-full px-4 ${renderIndex % 2 === 0 ? 'text-left' : 'text-right'}`}>
                                    - {pageNum} -
                                </div>
                            </FlipPage>
                        ))}
                    </HTMLFlipBook>
                </Document>
            )}
        </div>
    );
}
