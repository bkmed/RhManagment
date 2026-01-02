import json
import os

locales_dir = 'src/i18n/locales'
files = ['en.json', 'fr.json', 'ar.json', 'de.json', 'es.json']
data = {}

for f in files:
    path = os.path.join(locales_dir, f)
    with open(path, 'r', encoding='utf-8') as file:
        data[f] = json.load(file)

def get_keys(d, prefix=''):
    keys = set()
    for k, v in d.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.update(get_keys(v, full_key))
        else:
            keys.add(full_key)
    return keys

all_keys = {}
for f in files:
    all_keys[f] = get_keys(data[f])

union_keys = set().union(*all_keys.values())

for f in files:
    missing = union_keys - all_keys[f]
    extra = all_keys[f] - all_keys['en.json']
    print(f"--- {f} ---")
    print(f"Missing keys: {len(missing)}")
    if missing:
        for m in sorted(list(missing))[:10]:
            print(f"  - {m}")
        if len(missing) > 10: print("  ...")
    print(f"Extra keys compared to en.json: {len(extra)}")
    if extra:
        for e in sorted(list(extra))[:10]:
            print(f"  - {e}")
        if len(extra) > 10: print("  ...")
    print()

