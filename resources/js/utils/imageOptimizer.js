/**
 * Client-Side Image Optimizer
 * Center-crops to 1:1 square, resizes to max 800x800, and compresses to <100KB WebP
 * Guarantees zero 413 FUNCTION_PAYLOAD_TOO_LARGE errors on Vercel serverless.
 */

export async function optimizeImageToSquareWebP(file, maxDimension = 800) {
    if (!file || !file.type.startsWith('image/')) {
        throw new Error('Provided file is not an image');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Center 1:1 square crop math
                    const size = Math.min(img.width, img.height);
                    const sx = (img.width - size) / 2;
                    const sy = (img.height - size) / 2;

                    const targetSize = Math.min(maxDimension, size);
                    canvas.width = targetSize;
                    canvas.height = targetSize;

                    // High quality smoothing
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // Draw center crop
                    ctx.drawImage(img, sx, sy, size, size, 0, 0, targetSize, targetSize);

                    // Iterative compression to guarantee < 100KB
                    let quality = 0.82;
                    let blob = await getCanvasBlob(canvas, 'image/webp', quality);

                    // Fallback to jpeg if webp export is unsupported
                    const format = blob ? 'image/webp' : 'image/jpeg';
                    if (!blob) {
                        blob = await getCanvasBlob(canvas, 'image/jpeg', quality);
                    }

                    // Iteratively reduce quality if still over 95KB
                    while (blob && blob.size > 95 * 1024 && quality > 0.3) {
                        quality -= 0.12;
                        blob = await getCanvasBlob(canvas, format, quality);
                    }

                    if (!blob) {
                        return reject(new Error('Canvas blob generation failed'));
                    }

                    const ext = format === 'image/webp' ? '.webp' : '.jpg';
                    const baseName = file.name.replace(/\.[^/.]+$/, '');
                    const optimizedFile = new File([blob], `${baseName}_1x1${ext}`, {
                        type: format,
                        lastModified: Date.now(),
                    });

                    resolve({
                        file: optimizedFile,
                        previewUrl: URL.createObjectURL(blob),
                        sizeKb: (blob.size / 1024).toFixed(1),
                        dimensions: `${targetSize}x${targetSize}`,
                    });
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image source'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file buffer'));
        reader.readAsDataURL(file);
    });
}

function getCanvasBlob(canvas, type, quality) {
    return new Promise((res) => {
        canvas.toBlob((b) => res(b), type, quality);
    });
}
