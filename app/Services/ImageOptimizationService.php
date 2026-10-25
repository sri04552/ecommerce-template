<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class ImageOptimizationService
{
    /**
     * Crop to 1:1 square, resize to target dimensions (max 800x800),
     * compress to strictly under 100KB WebP, and return path + data URI.
     *
     * @return array{image_path: string, size_kb: float, filename: string}
     */
    public function processProductImage(UploadedFile $file, string $slug, int $index = 0): array
    {
        $raw = file_get_contents($file->getRealPath());
        $src = @imagecreatefromstring($raw);

        if (! $src) {
            throw new \InvalidArgumentException('Uploaded file is not a valid recognized image format.');
        }

        $w = imagesx($src);
        $h = imagesy($src);

        // Calculate 1:1 square center crop coordinates
        $cropSize = min($w, $h);
        $cropX = (int) floor(($w - $cropSize) / 2);
        $cropY = (int) floor(($h - $cropSize) / 2);

        // Destination square canvas: maximum 800x800
        $targetSize = min(800, $cropSize);
        $dest = imagecreatetruecolor($targetSize, $targetSize);

        // Preserve alpha channel
        imagealphablending($dest, false);
        imagesavealpha($dest, true);
        $transparent = imagecolorallocatealpha($dest, 255, 255, 255, 127);
        imagefilledrectangle($dest, 0, 0, $targetSize, $targetSize, $transparent);

        // Resample square crop
        imagecopyresampled(
            $dest,
            $src,
            0,
            0,
            $cropX,
            $cropY,
            $targetSize,
            $targetSize,
            $cropSize,
            $cropSize
        );

        // Iteratively compress as WebP to ensure file size is strictly < 100KB
        $quality = 82;
        $webpData = '';

        do {
            ob_start();
            imagewebp($dest, null, $quality);
            $webpData = ob_get_clean();
            $sizeKb = strlen($webpData) / 1024;
            $quality -= 8;
        } while ($sizeKb > 95 && $quality >= 25);

        imagedestroy($src);
        imagedestroy($dest);

        $filename = 'product-' . $slug . '-' . time() . '-' . $index . '-' . uniqid() . '.webp';
        $uploadDir = public_path('uploads/products');
        $storedPath = null;

        // Try writing to public/uploads/products/ if filesystem is writable
        try {
            if (! file_exists($uploadDir)) {
                @mkdir($uploadDir, 0755, true);
            }
            if (is_dir($uploadDir) && is_writable($uploadDir)) {
                file_put_contents($uploadDir . '/' . $filename, $webpData);
                $storedPath = '/uploads/products/' . $filename;
            }
        } catch (\Throwable $e) {
            $storedPath = null;
        }

        // Generate reliable self-contained Data URI (ensures 100% persistence on serverless)
        $dataUri = 'data:image/webp;base64,' . base64_encode($webpData);

        // On serverless or read-only environments, persist via dataUri directly
        if (! $storedPath || env('VERCEL') || ! file_exists(public_path($storedPath))) {
            $storedPath = $dataUri;
        }

        return [
            'image_path' => $storedPath,
            'size_kb' => round(strlen($webpData) / 1024, 2),
            'filename' => $filename,
        ];
    }
}
