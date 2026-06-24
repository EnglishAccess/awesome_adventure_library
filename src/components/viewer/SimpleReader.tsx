'use client';

import { FileText, ExternalLink } from 'lucide-react';

interface SimpleReaderProps {
    url: string;
    bookId: string;
    skipFirstPage?: boolean;
}

export default function SimpleReader({ url }: SimpleReaderProps) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-[#2a2a2a] text-white p-6 text-center">
            <FileText size={64} className="text-gray-400 mb-6" />
            <h2 className="text-xl font-bold mb-4">ブラウザの簡易表示モード</h2>
            <p className="text-gray-400 mb-8 max-w-md">
                お使いの端末で本を読むには、下のボタンからPDFを全画面（新しいタブ）で開いてください。
                Safari標準のビューアが起動し、快適にページをめくることができます。
            </p>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
                <ExternalLink size={24} />
                本を読む (全画面で開く)
            </a>
        </div>
    );
}
