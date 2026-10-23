<?php

namespace App\Console\Commands;

use App\Services\ProductImageOptimizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class OptimizeProductImages extends Command
{
    protected $signature = 'products:optimize-images';
    protected $description = 'Yerel ürün görsellerini WebP formatında küçültür';

    public function handle(ProductImageOptimizer $optimizer): int
    {
        $saved = 0;
        foreach (DB::table('cached_product_images')->where('mime', '<>', 'image/webp')->lazyById(20, 'hash') as $row) {
            $body = base64_decode($row->contents);
            [$optimized, $mime] = $optimizer->optimize($body, $row->mime);
            if (strlen($optimized) < strlen($body)) {
                DB::table('cached_product_images')->where('hash', $row->hash)->update(['contents' => base64_encode($optimized), 'mime' => $mime]);
                $saved += strlen($body) - strlen($optimized);
            }
        }
        $this->info('Görseller küçültüldü. Kazanç: '.round($saved / 1048576, 1).' MB');
        return self::SUCCESS;
    }
}
