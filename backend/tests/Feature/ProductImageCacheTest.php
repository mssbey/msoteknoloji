<?php

namespace Tests\Feature;

use App\Services\ProductImageCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ProductImageCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_large_images_are_resized_and_compressed(): void
    {
        if (!function_exists('imagewebp')) $this->markTestSkipped('GD WebP desteği gerekli.');
        $image = imagecreatetruecolor(2400, 1200);
        ob_start(); imagejpeg($image, null, 100); $original = ob_get_clean();
        imagedestroy($image);
        [$body, $mime] = (new \App\Services\ProductImageOptimizer)->optimize($original, 'image/jpeg');
        $this->assertSame('image/webp', $mime);
        $this->assertLessThan(strlen($original), strlen($body));
        $this->assertSame(1400, getimagesizefromstring($body)[0]);
    }

    private function picture(): string
    {
        return base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    }

    public function test_images_are_persistent_deduplicated_and_served_without_remote_requests(): void
    {
        Http::preventStrayRequests();
        Http::fake(['https://msoteknoloji.sentos.com.tr/*' => Http::response($this->picture(), 200)]);
        $source = 'https://msoteknoloji.sentos.com.tr/urunres/test.gif';
        $local = (new ProductImageCache)->localize($source);
        $this->assertStringContainsString('/media/products/', $local);
        $this->assertSame($local, (new ProductImageCache)->localize($source));
        Http::assertSentCount(1);
        $path = parse_url($local, PHP_URL_PATH);
        $response = $this->get($path)->assertOk()->assertHeader('Content-Type', 'image/gif');
        $this->assertSame($this->picture(), $response->getContent());
        $this->assertStringContainsString('immutable', $response->headers->get('Cache-Control'));
        $this->withHeader('If-None-Match', $response->headers->get('ETag'))->get($path)->assertStatus(304);
        Http::assertSentCount(1);
        $this->assertDatabaseCount('cached_product_images', 1);
    }

    public function test_description_images_are_localized_and_lazy_loaded(): void
    {
        Http::preventStrayRequests();
        Http::fake(['https://msoteknoloji.sentos.com.tr/*' => Http::response($this->picture(), 200)]);
        $html = '<p>Açıklama</p><img src="https://msoteknoloji.sentos.com.tr/test.gif" srcset="https://remote.test/image.gif 2x">';
        $result = (new ProductImageCache)->localizeHtml($html);
        $this->assertStringContainsString('loading="lazy"', $result);
        $this->assertStringContainsString('/media/products/', $result);
        $this->assertStringNotContainsString('srcset=', $result);
        $this->assertStringNotContainsString('sentos.com.tr', $result);
    }

    public function test_missing_images_get_a_local_placeholder_and_invalid_content_is_rejected(): void
    {
        Http::fake(['https://msoteknoloji.sentos.com.tr/missing' => Http::response('', 404),
            'https://msoteknoloji.sentos.com.tr/invalid' => Http::response('<script>bad</script>', 200)]);
        $this->assertStringEndsWith('/images/product-unavailable.svg', (new ProductImageCache)->localize('https://msoteknoloji.sentos.com.tr/missing'));
        $this->assertStringEndsWith('/images/product-unavailable.svg', (new ProductImageCache)->localize('https://msoteknoloji.sentos.com.tr/invalid'));
        $this->assertDatabaseCount('cached_product_images', 0);
    }
}
