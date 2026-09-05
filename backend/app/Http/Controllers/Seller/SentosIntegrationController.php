<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Jobs\SyncSentosProductsJob;
use App\Models\SentosIntegration;
use Illuminate\Http\Request;

class SentosIntegrationController extends Controller
{
    public function show(Request $request)
    {
        $seller = $request->user()->seller ?? abort(403);
        $integration = SentosIntegration::where('seller_id', $seller->id)->first();
        return response()->json(['data' => $integration]);
    }

    public function update(Request $request)
    {
        $seller = $request->user()->seller ?? abort(403);

        $data = $request->validate([
            'api_key' => 'required|string|max:200',
            'api_secret' => 'required|string|max:200',
            'auto_sync' => 'nullable|boolean',
        ]);

        $integration = SentosIntegration::updateOrCreate(
            ['seller_id' => $seller->id],
            $data + ['is_active' => true],
        );

        return response()->json(['data' => $integration]);
    }

    public function sync(Request $request)
    {
        $seller = $request->user()->seller ?? abort(403);
        $integration = SentosIntegration::where('seller_id', $seller->id)->firstOrFail();
        SyncSentosProductsJob::dispatch($integration->id);
        return response()->json(['success' => true, 'message' => 'Senkronizasyon başlatıldı.']);
    }
}
