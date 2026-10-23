<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductImageCache
{
    private array $resolved = [];
    private array $prefetched = [];
    private array $unreachableHosts = [];

    private function allowed(string $url): bool
    {
        $hosts = array_merge([parse_url(config('integrations.sentos.base_url'), PHP_URL_HOST)],
            array_map('trim', explode(',', config('integrations.sentos.image_hosts'))));
        return parse_url($url, PHP_URL_SCHEME) === 'https' && in_array(parse_url($url, PHP_URL_HOST), $hosts, true);
    }

    // Sentos bazı sunuculara görsel adresini http ile döndürüyor; aynı kaynak https ile de sunuluyor.
    private function secure(string $url): string
    {
        return preg_replace('#^http://#i', 'https://', $url);
    }

    public function prefetch(array $urls, bool $refresh = false): void
    {
        $urls = array_map(fn ($url) => $url ? $this->secure($url) : $url, $urls);
        $urls = array_values(array_unique(array_filter($urls, fn ($url) => $url && $this->allowed($url) && !isset($this->resolved[$url]))));
        foreach (array_chunk($urls, 30) as $chunk) {
            $pending = [];
            foreach ($chunk as $url) {
                $cached = DB::table('cached_product_images')->where('source_hash', hash('sha256', $url))->latest('updated_at')->first(['hash']);
                if (isset($this->unreachableHosts[parse_url($url, PHP_URL_HOST)])) {
                    $this->fallback($url, $cached);
                    continue;
                }
                if ($cached && !$refresh) $this->resolved[$url] = $this->url($cached->hash);
                else $pending[] = $url;
            }
            $responses = Http::pool(function ($pool) use ($pending) {
                foreach ($pending as $index => $url) $pool->as((string) $index)->timeout(15)->connectTimeout(5)
                    ->withOptions(['allow_redirects' => false, 'verify' => config('integrations.sentos.image_ca_bundle') ?: true])->get($url);
            }, concurrency: 6);
            foreach ($pending as $index => $url) {
                $this->prefetched[$url] = $responses[$index];
                try { $this->localize($url, $refresh); } catch (\Throwable $e) { $this->prefetched[$url] = $e; }
            }
        }
    }

    public function localizeHtml(?string $html, bool $refresh = false): ?string
    {
        if (!$html) return $html;
        preg_match_all('/<img\b[^>]*\bsrc=["\x27]([^"\x27]+)["\x27][^>]*>/i', $html, $matches);
        $this->prefetch(array_map(fn ($url) => html_entity_decode($url, ENT_QUOTES | ENT_HTML5, 'UTF-8'), $matches[1]), $refresh);
        return preg_replace_callback('/<img\b[^>]*\bsrc=["\x27]([^"\x27]+)["\x27][^>]*>/i', function ($match) use ($refresh) {
            $source = html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $url = $this->localize($source, $refresh);
            $tag = str_replace($match[1], htmlspecialchars($url, ENT_QUOTES, 'UTF-8'), $match[0]);
            $tag = preg_replace('/\s+(?:srcset|loading|decoding)=["\x27][^"\x27]*["\x27]/i', '', $tag);
            return preg_replace('/^<img/i', '<img loading="lazy" decoding="async"', $tag);
        }, $html);
    }

    public function localize(?string $url, bool $refresh = false): ?string
    {
        if (!$url || str_contains($url, '/media/products/') || str_ends_with($url, '/images/product-unavailable.svg')) return $url;
        $url = $this->secure($url);
        if (isset($this->resolved[$url])) return $this->resolved[$url];
        if (!$this->allowed($url)) {
            throw new \RuntimeException('Ürün görselinin kaynak adresine izin verilmiyor.');
        }
        $sourceHash = hash('sha256', $url);
        $cached = DB::table('cached_product_images')->where('source_hash', $sourceHash)->latest('updated_at')->first(['hash']);
        if ($cached && !$refresh) return $this->resolved[$url] = $this->url($cached->hash);
        if (isset($this->unreachableHosts[parse_url($url, PHP_URL_HOST)])) return $this->fallback($url, $cached);

        try {
            $response = $this->prefetched[$url] ?? Http::timeout(15)->connectTimeout(5)->withOptions([
                'allow_redirects' => false,
                'verify' => config('integrations.sentos.image_ca_bundle') ?: true,
            ])->get($url);
            unset($this->prefetched[$url]);
            if ($response instanceof \Throwable) throw $response;
        } catch (\Throwable $e) {
            $this->unreachableHosts[parse_url($url, PHP_URL_HOST)] = true;
            return $this->fallback($url, $cached);
        }
        if (!$response->successful()) return $this->fallback($url, $cached);
        $body = $response->body();
        $info = @getimagesizefromstring($body);
        $mime = $info['mime'] ?? null;
        if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'], true) || strlen($body) > 15 * 1024 * 1024) {
            return $this->fallback($url, $cached);
        }
        [$body, $mime] = app(ProductImageOptimizer::class)->optimize($body, $mime);
        // İçerik değişince adres de değişir; eski sürümler eski sayfalarda çalışır.
        $hash = hash('sha256', $url . "\0" . $body);
        DB::table('cached_product_images')->updateOrInsert(['hash' => $hash], [
            'source_hash' => $sourceHash, 'source_url' => $url, 'mime' => $mime,
            'contents' => base64_encode($body), 'created_at' => now(), 'updated_at' => now(),
        ]);
        return $this->resolved[$url] = $this->url($hash);
    }

    public function url(string $hash): string
    {
        $mime = DB::table('cached_product_images')->where('hash', $hash)->value('mime');
        $extension = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', 'image/avif' => 'avif'][$mime] ?? 'jpg';
        $relative = '/media/products/' . $hash . '.' . $extension;
        $path = public_path(ltrim($relative, '/'));
        if (!app()->runningUnitTests() && !is_file($path)) {
            if (!is_dir(dirname($path))) mkdir(dirname($path), 0755, true);
            $contents = DB::table('cached_product_images')->where('hash', $hash)->value('contents');
            if (file_put_contents($path, base64_decode($contents), LOCK_EX) === false) {
                throw new \RuntimeException('Yerel görsel dosyası yazılamadı.');
            }
        }
        return rtrim(config('app.url'), '/') . $relative;
    }

    private function fallback(string $source, ?object $cached): string
    {
        Log::warning('Ürün görseli alınamadı; yerel yedek kullanıldı.', ['source' => $source, 'has_previous' => (bool) $cached]);
        return $this->resolved[$source] = $cached ? $this->url($cached->hash)
            : rtrim(config('app.url'), '/') . '/images/product-unavailable.svg';
    }
}
