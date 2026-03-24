import { Book } from '@/types';
import Reader from '@/components/viewer/Reader';
import Link from 'next/link';
import { ArrowLeft, BookX } from 'lucide-react';
import { getBook } from '@/app/actions';

export const revalidate = 0;

export default async function BookPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const book = await getBook(params.id);

    if (!book) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <BookX size={48} className="text-gray-300 mb-4" />
                <h1 className="text-xl font-bold text-gray-700">Book Not Found</h1>
                <p className="text-gray-500 mt-2 mb-6">探していた冒険の書は見つかりませんでした。</p>
                <Link href="/" className="text-amber-600 hover:underline flex items-center gap-1">
                    <ArrowLeft size={16} /> Libraryに戻る
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#2a2a2a]">
            {/* 
        Reader is a client component that handles the actual PDF rendering.
        We pass the book data (url) to it.
      */}
            <Reader book={book} />
        </div>
    );
}
