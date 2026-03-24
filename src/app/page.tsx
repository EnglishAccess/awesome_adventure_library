import { Book } from '@/types';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getBooks } from '@/app/actions';

export const revalidate = 0; // Disable cache for now

export default async function Home() {
  const books = await getBooks();

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner or Hero Section could go here */}

      <section>
        <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
          <BookOpen className="text-amber-600" />
          <span>New Arrivals</span>
        </h2>

        {books.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-amber-200 rounded-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
              <BookOpen size={32} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">まだ本がありません</h3>
            <p className="text-gray-500">
              ギルドの管理者が新しい冒険書を準備中です。<br />
              もう少々お待ちください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`} className="block group">
                <div className="bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200 overflow-hidden border border-[#E5E0D5] transform group-hover:-translate-y-1">
                  {/* Book Cover */}
                  <div className="aspect-[3/4] bg-gray-100 relative">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-200">
                        <BookOpen size={48} />
                      </div>
                    )}
                  </div>
                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-amber-700 transition-colors">{book.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{book.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
