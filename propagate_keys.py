import json
import os

locales_dir = 'src/i18n/locales'
base_file = 'en.json'
other_files = ['fr.json', 'ar.json', 'de.json', 'es.json']

with open(os.path.join(locales_dir, base_file), 'r', encoding='utf-8') as f:
    base_data = json.load(f)

def sync_dict(base, target):
    new_dict = {}
    for k, v in base.items():
        if k in target:
            if isinstance(v, dict) and isinstance(target[k], dict):
                new_dict[k] = sync_dict(v, target[k])
            else:
                new_dict[k] = target[k]
        else:
            new_dict[k] = v # Fallback to base
    return new_dict

for f in other_files:
    path = os.path.join(locales_dir, f)
    with open(path, 'r', encoding='utf-8') as file:
        target_data = json.load(file)
    
    updated_data = sync_dict(base_data, target_data)
    
    with open(path, 'w', encoding='utf-8') as file:
        json.dump(updated_data, file, ensure_ascii=False, indent=2)
    print(f"Synced {f}")

