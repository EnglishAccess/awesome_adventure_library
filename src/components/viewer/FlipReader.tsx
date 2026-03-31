'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { Document, Page } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface FlipReaderProps {
    url: string;
    bookId: string;
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

export default function FlipReader({ url, bookId }: FlipReaderProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const flipBookRef = useRef<any>(null); // Type definition for flipbook is tricky

    // Calculate dimensions based on window
    // Ideally dynamic, but for MVP fixed ratio good enough
    const [dimensions, setDimensions] = useState({ width: 450, height: 640 });

    useEffect(() => {
        const updateDim = () => {
            // A4 ratio approx 0.7
            const h = window.innerHeight * 0.85;
            const w = h * 0.7;
            setDimensions({ width: w, height: h });
        };
        updateDim();
        window.addEventListener('resize', updateDim);
        return () => window.removeEventListener('resize', updateDim);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);

        // Restore Logic
        const saved = localStorage.getItem(`progress_${bookId}`);
        if (saved && flipBookRef.current) {
            const p = parseInt(saved, 10);
            // Note: react-pageflip uses index from 0 for the whole spread logic?
            // Actually it seems to use index.
            // We'll try to flip to it after a short delay to ensure render
            setTimeout(() => {
                try {
                    // If it's a spread, we might need logic.
                    // Assuming simple flip to page index.
                    flipBookRef.current.pageFlip().flip(p - 1); // 0-indexed??
                } catch (e) { console.log(e); }
            }, 500);
        }
    }

    const onFlip = (e: any) => {
        const pageIndex = e.data; // Current page index (0, 1, 2...)
        setCurrentPage(pageIndex);
        // Save logical page number (1-indexed)
        localStorage.setItem(`progress_${bookId}`, (pageIndex + 1).toString());
    };

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
                        size="fixed"
                        minWidth={300}
                        maxWidth={1000}
                        minHeight={400}
                        maxHeight={1400}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={false} // We handle mobile separately
                        ref={flipBookRef}
                        onFlip={onFlip}
                        className="shadow-2xl"
                        style={{}} // Required prop
                        startPage={0}
                        drawShadow={true}
                        flippingTime={1000} // Slower for nicer animation
                        usePortrait={false} // Force spread on desktop
                        startZIndex={0}
                        autoSize={true}
                        clickEventForward={true}
                        useMouseEvents={true}
                        swipeDistance={30}
                        showPageCorners={true}
                        disableFlipByClick={false}
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <FlipPage key={index}>
                                <Page
                                    pageNumber={index + 1}
                                    width={dimensions.width}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    loading={
                                        <div className="w-full h-full bg-white flex items-center justify-center text-gray-300">
                                            <Loader2 className="animate-spin" />
                                        </div>
                                    }
                                />
                                {/* Page Number Footer */}
                                <div className={`absolute bottom-2 text-[10px] text-gray-400 font-mono w-full px-4 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                                    - {index + 1} -
                                </div>
                            </FlipPage>
                        ))}
                    </HTMLFlipBook>
                </Document>
            </div>
        </div>
    );
}
