'use client';

import { useEffect, useState } from 'react';
import { getBooks, deleteBookAction } from '@/app/actions';
import { Book } from '@/types';
import Link from 'next/link';
import { Plus, Trash2, Edit, LogOut, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this book?')) return;
        await deleteBookAction(id);
        await fetchBooks();
    };

    const handleLogout = async () => {
        window.location.href = '/';
    };

    if (loading) return <div className="p-8 text-center">Loading guild data...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="text-amber-600" />
                        Book Management
                    </h1>
                    <p className="text-sm text-gray-500">Guild Master Control Panel</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                    <Link
                        href="/admin/books/new"
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={18} /> Add New Book
                    </Link>
                </div>
            </div>

            {books.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-500">
                    <p className="mb-4">No books in the library yet.</p>
                    <Link href="/admin/books/new" className="text-amber-600 font-bold hover:underline">
                        Create the first book
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Title</th>
                                <th className="p-4 font-medium">Author</th>
                                <th className="p-4 font-medium">Views</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {books.map((book) => (
                                <tr key={book.id} className="hover:bg-amber-50/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{book.title}</td>
                                    <td className="p-4 text-gray-600">{book.author}</td>
                                    <td className="p-4 text-gray-500">{book.view_count}</td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button className="p-2 text-gray-400 hover:text-amber-600 transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(book.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
