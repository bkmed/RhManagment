import json
import os

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_keys(obj, prefix=''):
    keys = set()
    for k, v in obj.items():
        if isinstance(v, dict):
            keys.update(get_keys(v, f"{prefix}{k}."))
        else:
            keys.add(f"{prefix}{k}")
    return keys

locales_dir = 'src/i18n/locales'
en_path = os.path.join(locales_dir, 'en.json')
en_data = load_json(en_path)
en_keys = get_keys(en_data)

langs = ['fr', 'ar', 'de', 'es', 'zh', 'hi']
for lang in langs:
    path = os.path.join(locales_dir, f"{lang}.json")
    if not os.path.exists(path):
        print(f"Missing file: {lang}.json")
        continue
    
    data = load_json(path)
    keys = get_keys(data)
    missing = en_keys - keys
    if missing:
        print(f"Missing in {lang}:")
        for k in sorted(missing):
            print(f"  - {k}")
