<?php

namespace App\Services;

class ProductImageOptimizer
{
    public function optimize(string $body, string $mime): array
    {
        if (!function_exists('imagewebp') || $mime === 'image/gif') return [$body, $mime];
        $size = @getimagesizefromstring($body);
        if (!$size || $size[0] * $size[1] > 40000000) return [$body, $mime];
        $image = @imagecreatefromstring($body);
        if (!$image) return [$body, $mime];
        $scale = min(1, 1400 / max($size[0], $size[1]));
        $target = imagecreatetruecolor(max(1, (int) round($size[0] * $scale)), max(1, (int) round($size[1] * $scale)));
        imagealphablending($target, false);
        imagesavealpha($target, true);
        imagecopyresampled($target, $image, 0, 0, 0, 0, imagesx($target), imagesy($target), $size[0], $size[1]);
        ob_start();
        imagewebp($target, null, 80);
        $optimized = ob_get_clean();
        imagedestroy($image);
        imagedestroy($target);
        return $optimized && strlen($optimized) < strlen($body) ? [$optimized, 'image/webp'] : [$body, $mime];
    }
}
