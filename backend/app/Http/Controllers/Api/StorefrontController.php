<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StorefrontCatalog;

class StorefrontController extends Controller
{
    public function index(StorefrontCatalog $catalog)
    {
        return response()->json(['success' => true, 'data' => $catalog->summary()]);
    }
}
