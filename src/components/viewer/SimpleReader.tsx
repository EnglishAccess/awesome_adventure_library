'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SimpleReaderProps {
    url: string;
    bookId: string;
    skipFirstPage?: boolean;
}

export default function SimpleReader({ url }: SimpleReaderProps) {
    const [loading, setLoading] = useState(true);

    return (
        <div className="relative w-full h-full bg-[#2a2a2a]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50 z-10">
                    <Loader2 className="animate-spin mr-2" />
                    <span>Loading PDF...</span>
                </div>
            )}
            <iframe
                src={url}
                className="w-full h-full border-0"
                title="PDF Viewer"
                onLoad={() => setLoading(false)}
            />
        </div>
    );
}
