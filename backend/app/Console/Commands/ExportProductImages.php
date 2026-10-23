<?php

namespace App\Console\Commands;

use App\Services\ProductImageCache;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExportProductImages extends Command
{
    protected $signature = 'products:export-images';
    protected $description = 'Kalıcı görsel deposundan hızlı statik dosya önbelleğini hazırlar';

    public function handle(ProductImageCache $cache): int
    {
        $urls = [];
        foreach (DB::table('cached_product_images')->select('hash')->lazyById(100, 'hash') as $row) $urls[$row->hash] = $cache->url($row->hash);
        foreach (['products' => ['og_image', 'description'], 'product_images' => ['url', 'path'], 'product_variants' => ['image']] as $table => $fields) {
            foreach (DB::table($table)->orderBy('id')->cursor() as $row) {
                $changes = [];
                foreach ($fields as $field) {
                    if (!$row->$field) continue;
                    $value = preg_replace_callback('~https?://[^\s"\x27<>]+/media/products/([a-f0-9]{64})(?:\.(?:jpg|png|webp|gif|avif))?~',
                        fn ($match) => $urls[$match[1]] ?? $match[0], $row->$field);
                    if ($value !== $row->$field) $changes[$field] = $value;
                }
                if ($changes) DB::table($table)->where('id', $row->id)->update($changes);
            }
        }
        $this->info(count($urls).' görsel statik sunuma hazırlandı.');
        return self::SUCCESS;
    }
}
