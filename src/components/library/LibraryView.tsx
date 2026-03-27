'use client';

import { useState, useMemo } from 'react';
import { Book } from '@/types';
import Link from 'next/link';
import { BookOpen, Search, FilterX } from 'lucide-react';

interface LibraryViewProps {
  initialBooks: Book[];
}

export default function LibraryView({ initialBooks }: LibraryViewProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  // Extract unique values for filters
  const levels = useMemo(() => {
    const vals = new Set(initialBooks.map(b => b.level).filter(Boolean) as string[]);
    return Array.from(vals).sort();
  }, [initialBooks]);

  const units = useMemo(() => {
    let relevantBooks = initialBooks;
    if (selectedLevel) relevantBooks = relevantBooks.filter(b => b.level === selectedLevel);
    
    const vals = new Set(relevantBooks.map(b => b.unit).filter(Boolean) as string[]);
    return Array.from(vals).sort();
  }, [initialBooks, selectedLevel]);

  // Filter books
  const filteredBooks = useMemo(() => {
    return initialBooks.filter(book => {
      if (selectedLevel && book.level !== selectedLevel) return false;
      if (selectedUnit && book.unit !== selectedUnit) return false;
      return true;
    });
  }, [initialBooks, selectedLevel, selectedUnit]);

  const clearFilters = () => {
    setSelectedLevel('');
    setSelectedUnit('');
  };

  const hasFilters = selectedLevel || selectedUnit;

  return (
    <section>
      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E0D5] mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 mb-1">レベル (Level)</label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setSelectedUnit('');
              }}
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 disabled:opacity-50"
              disabled={levels.length === 0}
            >
              <option value="">すべて (All)</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 mb-1">ユニット (Unit)</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 disabled:opacity-50"
              disabled={units.length === 0}
            >
              <option value="">すべて (All)</option>
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="p-2 h-[42px] px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <FilterX size={16} /> クリア
            </button>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-amber-600" />
          <span>Library</span>
        </div>
        <span className="text-sm font-normal text-gray-500">
          全 {filteredBooks.length} 冊
        </span>
      </h2>

      {filteredBooks.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-amber-200 rounded-xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
            <Search size={32} className="text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">本が見つかりませんでした</h3>
          <p className="text-gray-500">
            {hasFilters ? '条件を変えて検索してみてください。' : 'ギルドの管理者が新しい冒険書を準備中です。'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-amber-600 hover:underline font-bold">
              条件をクリアする
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`} className="block group">
              <div className="bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200 overflow-hidden border border-[#E5E0D5] transform group-hover:-translate-y-1">
                {/* Categorization Badges / Tags */}
                {(book.level || book.unit) && (
                   <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1 z-10 pointer-events-none">
                     {book.level && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 shadow-sm border border-amber-200/50 backdrop-blur-sm">{book.level}</span>}
                     {book.unit && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200/50 backdrop-blur-sm">{book.unit}</span>}
                   </div>
                )}

                {/* Book Cover */}
                <div className="w-full bg-gray-100 relative flex items-center justify-center">
                  {book.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-auto object-contain"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] flex items-center justify-center bg-amber-50 text-amber-200">
                      <BookOpen size={48} />
                    </div>
                  )}
                </div>
                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-amber-700 transition-colors">{book.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{book.author || '読みもの'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
