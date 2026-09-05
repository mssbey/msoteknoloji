import json, urllib.request, concurrent.futures, pathlib
base = 'http://localhost:8000/api/'
def get(path):
    with urllib.request.urlopen(base + path, timeout=20) as r: return json.load(r)['data']
catalog = get('storefront')
assert sum(g['products_count'] for g in catalog['groups']) == catalog['total']
for group in catalog['groups']:
    data = get('products?collection=' + group['slug'] + '&per_page=100')
    assert data['total'] == group['products_count'], group['slug']
    assert all(p['collection_slug'] == group['slug'] for p in data['data'])
    leaf = group['categories'][0]['slug']
    filtered = get('products?collection=' + group['slug'] + '&category=' + leaf)
    assert all(p['category']['slug'] == leaf for p in filtered['data'])
a,b = get('products?page=1'), get('products?page=2')
assert not set(p['id'] for p in a['data']) & set(p['id'] for p in b['data'])
for sort, reverse in [('price_asc',False),('price_desc',True)]:
    data=get('products?sort='+sort+'&per_page=100')
    prices=[float(p['price']) for p in data['data']]
    assert prices==sorted(prices,reverse=reverse)
images=get('products?has_image=true&per_page=100')
assert all(p['og_image'] for p in images['data'])
def image_status(p):
    try:
        with urllib.request.urlopen(p['og_image'],timeout=20) as r:
            assert r.status==200 and r.headers.get('Content-Type','').startswith('image/')
            return [p['id'],r.status]
    except Exception as e: return [p['id'],str(e)]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: status=list(pool.map(image_status,images['data']))
print(json.dumps({'catalog_total':catalog['total'],'groups':len(catalog['groups']),'group_filters':'passed','subcategories':'passed','pagination':'passed','price_sort':'passed','image_count':images['total'],'image_status':status},ensure_ascii=False))
