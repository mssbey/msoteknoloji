<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreShowcaseSection;
use Illuminate\Http\Request;

class StoreCustomizationController extends Controller
{
    public function show(Request $request)
    {
        $store = $this->resolveStore($request);
        return response()->json(['data' => $store->load('showcaseSections')]);
    }

    public function update(Request $request)
    {
        $store = $this->resolveStore($request);

        $data = $request->validate([
            'name' => 'sometimes|string|max:120',
            'description' => 'nullable|string|max:2000',
            'logo' => 'nullable|string|max:500',
            'banner' => 'nullable|string|max:500',
            'theme_color' => 'sometimes|string|size:7',
            'accent_color' => 'sometimes|string|size:7',
            'text_color' => 'sometimes|string|size:7',
            'announcement_text' => 'nullable|string|max:200',
            'announcement_bg' => 'nullable|string|size:7',
            'announcement_active' => 'nullable|boolean',
            'whatsapp_number' => 'nullable|string|max:20',
            'featured_section_title' => 'nullable|string|max:120',
            'welcome_coupon_active' => 'nullable|boolean',
            'welcome_coupon_percent' => 'nullable|integer|min:1|max:50',
            'seo_title' => 'nullable|string|max:200',
            'seo_description' => 'nullable|string|max:300',
        ]);

        $store->update($data);
        return response()->json(['data' => $store->fresh()]);
    }

    public function updateShowcase(Request $request)
    {
        $store = $this->resolveStore($request);

        $data = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'nullable|integer',
            'sections.*.type' => 'required|in:featured,campaign,new_arrivals,best_sellers,custom',
            'sections.*.title' => 'required|string|max:120',
            'sections.*.subtitle' => 'nullable|string|max:200',
            'sections.*.product_ids' => 'nullable|array',
            'sections.*.cta_text' => 'nullable|string|max:80',
            'sections.*.cta_url' => 'nullable|string|max:300',
            'sections.*.position' => 'nullable|integer|min:0',
            'sections.*.is_active' => 'nullable|boolean',
        ]);

        $keep = [];
        foreach ($data['sections'] as $i => $sec) {
            $section = isset($sec['id'])
                ? StoreShowcaseSection::where('store_id', $store->id)->find($sec['id']) ?? new StoreShowcaseSection()
                : new StoreShowcaseSection();

            $section->fill(array_merge($sec, ['store_id' => $store->id, 'position' => $sec['position'] ?? $i]));
            $section->save();
            $keep[] = $section->id;
        }

        StoreShowcaseSection::where('store_id', $store->id)
            ->whereNotIn('id', $keep)
            ->delete();

        return response()->json(['data' => $store->fresh()->showcaseSections]);
    }

    private function resolveStore(Request $request): Store
    {
        $seller = $request->user()->seller ?? abort(403, 'Satıcı kaydı bulunamadı.');
        return $seller->store ?? abort(404, 'Mağaza henüz oluşturulmamış.');
    }
}
