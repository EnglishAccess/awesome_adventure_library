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

// Custom Page Component required by react-pageflip
const FlipPage = forwardRef<HTMLDivElement, any>((props, ref) => {
    return (
        <div ref={ref} className="bg-white shadow-md overflow-hidden" style={{ backgroundColor: '#fff' }}>
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

    // Dimensions are derived from PDF aspect ratio + viewport size
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const [pageAspectRatio, setPageAspectRatio] = useState<number | null>(null);

    // Step 1: Detect actual aspect ratio from first PDF page
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
                if (!cancelled) setPageAspectRatio(0.707); // Fallback A4 portrait
            }
        }
        detectPageSize();
        return () => { cancelled = true; };
    }, [url]);

    // Step 2: Calculate page dimensions so that the 2-page spread fits both width and height
    useEffect(() => {
        if (pageAspectRatio === null) return;

        const HEADER_H = 60;   // approx header height
        const MARGIN_W = 80;   // left/right navigation buttons space
        const MARGIN_H = 80;   // top/bottom margin

        const calculateDim = () => {
            const availH = window.innerHeight - HEADER_H - MARGIN_H;
            // spread = 2 pages side by side, so each page gets half the width
            const availW = (window.innerWidth - MARGIN_W) / 2;

            let pageW: number;
            let pageH: number;

            // Fit by height first, then ensure it doesn't exceed half the viewport width
            pageH = availH;
            pageW = pageH * pageAspectRatio;

            if (pageW > availW) {
                pageW = availW;
                pageH = pageW / pageAspectRatio;
            }

            setDimensions({
                width: Math.floor(pageW),
                height: Math.floor(pageH),
            });
        };

        calculateDim();
        window.addEventListener('resize', calculateDim);
        return () => window.removeEventListener('resize', calculateDim);
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

    if (!dimensions) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#333] text-white/50">
                <Loader2 className="animate-spin mr-2" />
                <span>Loading...</span>
            </div>
        );
    }

    const pagesArray = Array.from(new Array(numPages), (_, i) => i + 1);
    const pagesToRender = skipFirstPage && pagesArray.length > 1 ? pagesArray.slice(1) : pagesArray;

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-[#333]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50 z-20 bg-[#333]">
                    <Loader2 className="animate-spin mr-2" />
                    <span>Loading Book...</span>
                </div>
            )}

            {/* Left/Right Navigation */}
            {!loading && (
                <>
                    <button
                        className="absolute left-4 z-10 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                        onClick={() => flipBookRef.current?.pageFlip().flipPrev()}
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        className="absolute right-4 z-10 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                        onClick={() => flipBookRef.current?.pageFlip().flipNext()}
                    >
                        <ChevronRight size={32} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm bg-black/20 px-4 py-1 rounded-full pointer-events-none">
                        Page {currentPage + 1} / {numPages}
                    </div>
                </>
            )}

            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={null}
            >
                <HTMLFlipBook
                    width={dimensions.width}
                    height={dimensions.height}
                    size="fixed"
                    minWidth={200}
                    maxWidth={2000}
                    minHeight={200}
                    maxHeight={2000}
                    maxShadowOpacity={0.5}
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
                                    <div className="flex items-center justify-center bg-white text-gray-300"
                                        style={{ width: dimensions.width, height: dimensions.height }}>
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
        </div>
    );
}
