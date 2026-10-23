<?php

use Illuminate\Support\Facades\Route;

Route::get('/media/products/{hash}', \App\Http\Controllers\ProductImageController::class)
    ->withoutMiddleware('web')
    ->where('hash', '[a-f0-9]{64}');
Route::get('/media/products/{hash}.{extension}', \App\Http\Controllers\ProductImageController::class)
    ->withoutMiddleware('web')
    ->where('hash', '[a-f0-9]{64}')->where('extension', 'jpg|png|webp|gif|avif');

Route::get('/', function () {
    return view('welcome');
});
