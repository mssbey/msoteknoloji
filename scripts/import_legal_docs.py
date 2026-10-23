"""Kök dizindeki hukuki .docx metinlerini site ve PDF'lerin kullandığı JSON'a çevirir.

Kullanım (proje kökünden):  python scripts/import_legal_docs.py
Metin değiştiğinde .docx dosyasını güncelleyip betiği yeniden çalıştırın; sürüm,
belgenin son değiştirilme tarihinden üretilir ve siparişlerde kayıt altına alınır.
"""
import json
import re
import zipfile
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = {
    'mesafeli-satis-sozlesmesi': 'Mesafeli Satış Sözleşmesi.docx',
    'on-bilgilendirme-formu': 'Ön Bilgilendirme Formu.docx',
    'uyelik-sozlesmesi': 'Üyelik Sözleşmesi.docx',
    'gizlilik-kvkk': 'Gizlilik Politikası (KVKK).docx',
    'cerez-politikasi': 'Çerez Politikası.docx',
    'iptal-iade-kosullari': 'İptal ve İade Koşulları.docx',
}
TARGETS = [ROOT / 'backend/resources/legal', ROOT / 'frontend/src/content/legal']
UPPER = 'A-ZÇĞİÖŞÜÂÎÛ'


def runs(paragraph: str):
    """Paragrafı satırlara (w:br) ve her satırı (metin, kalın) parçalarına böler."""
    lines, current = [], []
    for run in re.findall(r'<w:r[ >].*?</w:r>', paragraph, re.S):
        bold = bool(re.search(r'<w:b/>|<w:b w:val="(1|true)"/>', run))
        for token in re.findall(r'<w:t[^>]*>[^<]*</w:t>|<w:br/>|<w:tab/>', run):
            if token == '<w:br/>':
                lines.append(current)
                current = []
            elif token == '<w:tab/>':
                current.append((' ', bold))
            else:
                current.append((unescape(re.sub(r'<[^>]+>', '', token)), bold))
    lines.append(current)
    return [l for l in lines if ''.join(t for t, _ in l).strip()]


def block(line, listed: bool, first: bool):
    text = re.sub(r'\s+', ' ', ''.join(t for t, _ in line)).strip()
    all_bold = all(b for t, b in line if t.strip())
    if first:
        return {'type': 'title', 'text': text}
    if all_bold and (text.startswith('MADDE ') or re.fullmatch(rf'(\d+(\.\d+)*\.?\s+)?[{UPPER}0-9 ()/,&–-]+', text)) and ':' not in text:
        return {'type': 'heading', 'text': text}
    if listed:
        return {'type': 'item', 'text': text}
    if line and line[0][1] and ':' in text and len(text.split(':', 1)[0]) <= 60:
        label, value = text.split(':', 1)
        return {'type': 'field', 'label': label.strip(), 'text': value.strip()}
    return {'type': 'paragraph', 'text': text, **({'strong': True} if all_bold else {})}


def convert(path: Path):
    archive = zipfile.ZipFile(path)
    xml = archive.read('word/document.xml').decode('utf-8')
    core = archive.read('docProps/core.xml').decode('utf-8')
    modified = re.search(r'<dcterms:modified[^>]*>(\d{4})-(\d{2})-(\d{2})', core)
    version = 'v' + '.'.join(modified.groups()) if modified else 'v1'
    body = re.search(r'<w:body>(.*)</w:body>', xml, re.S).group(1)

    blocks = []
    for part in re.findall(r'<w:tbl>.*?</w:tbl>|<w:p[ >].*?</w:p>', body, re.S):
        if part.startswith('<w:tbl>'):
            rows = []
            for row in re.findall(r'<w:tr[ >].*?</w:tr>', part, re.S):
                rows.append([' '.join(''.join(t for t, _ in l) for l in runs(c)).strip()
                             for c in re.findall(r'<w:tc>.*?</w:tc>', row, re.S)])
            blocks.append({'type': 'table', 'rows': rows})
            continue
        listed = '<w:numPr>' in part
        for line in runs(part):
            blocks.append(block(line, listed, not blocks))
    return {'version': version, 'title': blocks[0]['text'], 'blocks': tidy(blocks)}


def tidy(blocks):
    """Ürün listesi yer tutucusunu tabloya çevirir; geliştiriciye yönelik
    "sistem tarafından ... gösterilir/oluşturulur" açıklamasını ve maddelerini çıkarır
    (bu bilgiler ürün tablosunun sütunlarıdır)."""
    out, skipping = [], False
    for b in blocks:
        if skipping and b['type'] == 'item':
            continue
        skipping = False
        if b.get('text') == '{{urun_listesi}}':
            out.append({'type': 'products'})
        elif b['type'] == 'paragraph' and 'sistem tarafından' in b['text'] and b['text'].endswith(':'):
            skipping = True
        elif b['type'] == 'field' and not b['text']:
            out.append({'type': 'paragraph', 'text': b['label'] + ':', 'strong': True})
        else:
            out.append(b)
    return out


for slug, name in DOCS.items():
    data = convert(ROOT / name)
    for target in TARGETS:
        target.mkdir(parents=True, exist_ok=True)
        (target / f'{slug}.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{slug}: {data["version"]}, {len(data["blocks"])} blok')
