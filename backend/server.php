<?php

// Laravel geliştirme sunucusunda ürün resimleri framework başlatılmadan sunulur.
$publicPath = getcwd();
$uri = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '');
if (in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)
    && preg_match('~^/media/products/([a-f0-9]{64})\.(jpg|png|webp|gif|avif)$~', $uri, $matches)
    && is_file($publicPath . $uri)) {
    $mime = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif', 'avif' => 'image/avif'][$matches[2]];
    $etag = '"' . $matches[1] . '"';
    header('Content-Type: ' . $mime);
    header('Cache-Control: public, max-age=31536000, immutable');
    header('ETag: ' . $etag);
    header('X-Content-Type-Options: nosniff');
    if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
        http_response_code(304);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        readfile($publicPath . $uri);
    }
    return;
}
if ($uri !== '/' && is_file($publicPath . $uri)) return false;
require $publicPath . '/index.php';
