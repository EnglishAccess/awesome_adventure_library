import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
        ],
    },
    transpilePackages: ['pdfjs-dist'],
    turbopack: {
        resolveAlias: {
            'pdfjs-dist': 'pdfjs-dist/legacy/build/pdf',
        },
    },
    webpack: (config) => {
        config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/legacy/build/pdf';
        return config;
    },
};

export default nextConfig;
