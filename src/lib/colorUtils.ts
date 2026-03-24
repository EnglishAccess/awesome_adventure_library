
export const extractColorFromImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
        const fallbackColor = '#C8B698'; // Default fallback light brown
        const img = new Image();
        if (imageSrc.startsWith('http')) {
            img.crossOrigin = 'Anonymous';
        }
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                resolve(fallbackColor);
                return;
            }

            const scale = 50; 
            canvas.width = scale;
            canvas.height = scale;

            // Fill with default light brown to handle transparent images
            ctx.fillStyle = fallbackColor;
            ctx.fillRect(0, 0, scale, scale);

            // Draw image proportionally down to evaluate pixels
            ctx.drawImage(img, 0, 0, scale, scale);

            const imageData = ctx.getImageData(0, 0, scale, scale).data;
            const colorCounts: Record<string, { r: number; g: number; b: number; count: number }> = {};
            
            let maxCount = 0;
            // Defaults to the tan color components (200, 182, 152 are roughly #C8B698)
            let dominantR = 200, dominantG = 182, dominantB = 152; 

            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const a = imageData[i + 3];

                if (a < 128) continue; // Skip highly transparent pixels

                // Quantize by step (e.g. 24) to group similar color shades together
                const step = 24;
                const rQ = Math.round(r / step) * step;
                const gQ = Math.round(g / step) * step;
                const bQ = Math.round(b / step) * step;

                // Ignore extremely dark pixels (like #000000 borders) so they don't dominate the spine
                if (r < 15 && g < 15 && b < 15) continue;

                const key = `${rQ},${gQ},${bQ}`;
                if (!colorCounts[key]) {
                    colorCounts[key] = { r: 0, g: 0, b: 0, count: 0 };
                }
                
                colorCounts[key].r += r;
                colorCounts[key].g += g;
                colorCounts[key].b += b;
                colorCounts[key].count++;

                if (colorCounts[key].count > maxCount) {
                    maxCount = colorCounts[key].count;
                    dominantR = Math.round(colorCounts[key].r / colorCounts[key].count);
                    dominantG = Math.round(colorCounts[key].g / colorCounts[key].count);
                    dominantB = Math.round(colorCounts[key].b / colorCounts[key].count);
                }
            }

            // Convert back to Hex
            const toHex = (n: number) => {
                const hex = Math.max(0, Math.min(255, n)).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };

            resolve(`#${toHex(dominantR)}${toHex(dominantG)}${toHex(dominantB)}`);
        };

        img.onerror = () => {
            resolve(fallbackColor);
        };
    });
};
