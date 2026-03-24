'use client';

import { useState, useRef } from 'react';
import { uploadBookAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { extractColorFromImage } from '@/lib/colorUtils';
import { Upload, Loader2, Image as ImageIcon, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function NewBookParams() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [spineColor, setSpineColor] = useState('#C8B698'); // Default light brown

    // Form States
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [bookFile, setBookFile] = useState<File | null>(null);

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            // Create local preview URL
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Extract color for spine
            const color = await extractColorFromImage(objectUrl);
            setSpineColor(color);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coverFile || !bookFile) {
            alert('Cover image and Book file are required.');
            return;
        }

        setLoading(true);

        try {
            // Local Upload Logic
            const formData = new FormData();
            formData.append('title', title);
            formData.append('author', author);
            formData.append('description', description);
            
            const bookExt = bookFile.name.split('.').pop();
            const fileType = bookExt?.toLowerCase() === 'pdf' ? 'pdf' : 'text';
            formData.append('fileType', fileType);
            
            formData.append('cover', coverFile);
            formData.append('book', bookFile);

            await uploadBookAction(formData);

            alert('Book uploaded locally successfully!');
            // Soft Navigationバグ回避のため、Hard Refreshで遷移します。
            window.location.href = '/admin/books';

        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Link href="/admin/books" className="inline-flex items-center text-gray-500 hover:text-amber-700 mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
            </Link>

            <div className="bg-white rounded-xl shadow-lg border border-[#E5E0D5] overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-[#FAF9F6]">
                    <h1 className="text-2xl font-bold text-amber-900">Add New Book</h1>
                    <p className="text-sm text-gray-500">Upload a new adventure to the library.</p>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left: Input Form */}
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="e.g. The Lost City"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Author</label>
                            <input
                                type="text"
                                required
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="e.g. J.R.R. Tolkien"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="Brief summary used for search and intro..."
                            />
                        </div>

                        {/* File Inputs */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Book File (PDF or Text)</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors p-4 text-center cursor-pointer group">
                                    <input
                                        type="file"
                                        accept=".pdf,.txt"
                                        onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center">
                                        <FileText className={`mb-2 ${bookFile ? 'text-green-600' : 'text-gray-400 group-hover:text-amber-500'}`} />
                                        <span className="text-sm text-gray-600 font-medium">
                                            {bookFile ? bookFile.name : 'Click to select PDF or Txt'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors p-4 text-center cursor-pointer group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center">
                                        <ImageIcon className={`mb-2 ${coverFile ? 'text-green-600' : 'text-gray-400 group-hover:text-amber-500'}`} />
                                        <span className="text-sm text-gray-600 font-medium">
                                            {coverFile ? 'Change Cover Image' : 'Click to select Cover'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Upload />}
                            Upload Book
                        </button>
                    </form>

                    {/* Right: Preview Area */}
                    <div className="flex flex-col items-center justify-start pt-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Preview & Spine Check</h3>

                        <div className="flex gap-0 shadow-2xl transition-transform transform hover:scale-105 duration-300">
                            {/* Back Cover Preview (Same color as spine) */}
                            <div
                                className="w-48 md:w-56 h-64 md:h-80 relative overflow-hidden flex items-center justify-center border-r border-white/10"
                                style={{ backgroundColor: spineColor }}
                            >
                                <span className="text-white/30 text-xs font-bold uppercase tracking-widest rotate-[-45deg]">
                                    Back Cover
                                </span>
                            </div>

                            {/* Spine Preview */}
                            <div
                                className="w-8 h-64 md:h-80 flex items-center justify-center pb-4 text-center writing-vertical-rl border-r border-white/20"
                                style={{ backgroundColor: spineColor }}
                            >
                                <span className="text-white/90 text-xs font-bold tracking-widest truncate max-h-[80%]">
                                    {title || 'TITLE'}
                                </span>
                                <span className="text-white/60 text-[10px] mt-2">
                                    {author || 'AUTHOR'}
                                </span>
                            </div>

                            {/* Front Cover Preview */}
                            <div className="w-48 md:w-56 h-64 md:h-80 bg-gray-200 relative overflow-hidden">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Cover Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                                        <ImageIcon size={48} className="mb-2 opacity-50" />
                                        <span className="text-xs">No Cover Selected</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-amber-50 rounded-lg text-xs text-amber-800 max-w-xs">
                            <p className="flex items-center gap-2 font-bold mb-1">
                                <RefreshCw size={12} /> Auto Spine Color
                            </p>
                            <p>
                                The spine color is automatically extracted from the dominant color of your cover image.
                                <br />
                                <span className="inline-block w-3 h-3 rounded-full border border-black/10 align-middle mr-1 ml-1" style={{ backgroundColor: spineColor }}></span>
                                Detected: <span className="font-mono">{spineColor}</span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
