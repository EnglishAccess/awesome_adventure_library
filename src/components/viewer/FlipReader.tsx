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
        <div ref={ref} className="bg-transparent shadow-none overflow-visible" style={{}}>
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

    // Dynamic dimensions based on actual PDF page aspect ratio
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const [pageAspectRatio, setPageAspectRatio] = useState<number | null>(null); // width / height

    // Step 1: Load the PDF and detect page dimensions from the first page
    useEffect(() => {
        let cancelled = false;
        async function detectPageSize() {
            try {
                const loadingTask = pdfjs.getDocument(url);
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1 });
                if (!cancelled) {
                    // viewport.width / viewport.height gives us the aspect ratio
                    setPageAspectRatio(viewport.width / viewport.height);
                }
            } catch (e) {
                console.error('Failed to detect PDF page size:', e);
                // Fallback to A4 portrait ratio
                if (!cancelled) setPageAspectRatio(0.707);
            }
        }
        detectPageSize();
        return () => { cancelled = true; };
    }, [url]);

    // Step 2: Calculate FlipBook dimensions based on detected aspect ratio + window size
    useEffect(() => {
        if (pageAspectRatio === null) return;

        const updateDim = () => {
            // Maximum possible space
            const maxH = window.innerHeight - 100;
            const maxW = (window.innerWidth - 60) / 2; 

            let pageW: number;
            let pageH: number;

            if (pageAspectRatio >= 1) {
                // Landscape PDF: width >= height
                pageW = Math.min(maxW, maxH * pageAspectRatio);
                pageH = pageW / pageAspectRatio;
                if (pageH > maxH) {
                    pageH = maxH;
                    pageW = pageH * pageAspectRatio;
                }
            } else {
                // Portrait PDF: height > width
                pageH = Math.min(maxH, maxW / pageAspectRatio);
                pageW = pageH * pageAspectRatio;
                if (pageW > maxW) {
                    pageW = maxW;
                    pageH = pageW / pageAspectRatio;
                }
            }

            setDimensions({
                width: Math.round(pageW),
                height: Math.round(pageH),
            });
        };
        updateDim();
        window.addEventListener('resize', updateDim);
        return () => window.removeEventListener('resize', updateDim);
    }, [pageAspectRatio]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);

        // Restore Logic
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

    // Don't render FlipBook until we know the dimensions
    if (!dimensions) {
        return (
            <div className="relative w-full h-full flex items-center justify-center bg-[#333]">
                <div className="flex items-center text-white/50">
                    <Loader2 className="animate-spin mb-2" />
                    <span className="ml-2">Detecting page size...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-[#333]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50 z-20 bg-[#333]">
                    <Loader2 className="animate-spin mb-2" />
                    <span className="ml-2">Loading Book...</span>
                </div>
            )}

            {/* Navigation Layer */}
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
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-sm bg-black/20 px-4 py-1 rounded-full">
                        Page {currentPage + 1} / {numPages}
                    </div>
                </>
            )}

            <div className="flex items-center justify-center max-w-full max-h-full">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={null}
                >
                    <HTMLFlipBook
                        width={dimensions.width}
                        height={dimensions.height}
                        size="stretch"
                        minWidth={200}
                        maxWidth={1500}
                        minHeight={200}
                        maxHeight={1500}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={false}
                        ref={flipBookRef}
                        onFlip={onFlip}
                        className="shadow-2xl"
                        style={{}}
                        startPage={0}
                        drawShadow={true}
                        flippingTime={1000}
                        usePortrait={false}
                        startZIndex={0}
                        autoSize={true}
                        clickEventForward={true}
                        useMouseEvents={true}
                        swipeDistance={30}
                        showPageCorners={true}
                        disableFlipByClick={false}
                    >
                        {(() => {
                            const pagesArray = Array.from(new Array(numPages), (el, index) => index + 1);
                            const pagesToRender = skipFirstPage && pagesArray.length > 1 ? pagesArray.slice(1) : pagesArray;

                            return pagesToRender.map((pageNum, renderIndex) => (
                                <FlipPage key={renderIndex}>
                                    <div className="w-full h-full flex items-center justify-center p-[1px]">
                                        <Page
                                            pageNumber={pageNum}
                                            width={dimensions.width - 4}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            loading={null}
                                        />
                                    </div>
                                    {/* Page Number Footer */}
                                    <div className={`absolute bottom-2 text-[10px] text-gray-400 font-mono w-full px-4 ${renderIndex % 2 === 0 ? 'text-left' : 'text-right'}`}>
                                        - {pageNum} -
                                    </div>
                                </FlipPage>
                            ));
                        })()}
                    </HTMLFlipBook>
                </Document>
            </div>
        </div>
    );
}
