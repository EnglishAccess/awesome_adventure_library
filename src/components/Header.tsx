'use client';

import Link from 'next/link';
import { Compass, BookOpen } from 'lucide-react';

export default function Header() {
    const handleLoginClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const pwd = window.prompt('Enter Guild Password:');
        if (pwd) {
            // Send to our simple auth API
            window.location.href = `/api/auth?pwd=${encodeURIComponent(pwd)}`;
        }
    };

    return (
        <header className="w-full bg-[#EFEBE4] border-b-4 border-[#C8B698] p-4 shadow-sm">
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo / Title */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="bg-amber-600 p-2 rounded-lg text-white shadow-md transform group-hover:scale-105 transition-transform">
                        <Compass size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl md:text-2xl font-bold text-amber-900 leading-tight tracking-tight font-serif">
                            Awesome Adventure Library
                        </h1>
                        <span className="text-xs text-amber-700 font-medium tracking-wider">
                            Are you ready for adventure?
                        </span>
                    </div>
                </Link>

                {/* Navigation (Simple for now) */}
                <nav className="flex items-center gap-4">
                    <button
                        onClick={handleLoginClick}
                        className="text-amber-800 hover:text-amber-600 font-bold text-sm flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <BookOpen size={16} />
                        <span className="hidden md:inline">Guild Login</span>
                    </button>
                </nav>
            </div>
        </header>
    );
}
