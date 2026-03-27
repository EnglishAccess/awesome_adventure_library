'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the form with SSR disabled to prevent pdfjs build errors
const NewBookForm = dynamic(() => import('@/components/admin/NewBookForm'), { 
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-600" size={48} />
        </div>
    )
});

export default function Page() {
    return <NewBookForm />;
}
