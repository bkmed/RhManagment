import json
import os
from collections import defaultdict

try:
    with open('lint-results.json', 'r') as f:
        results = json.load(f)

    file_errors = defaultdict(lambda: defaultdict(int))
    total_errors = 0

    for result in results:
        file_path = result.get('filePath', '').replace(os.getcwd() + '/', '')
        messages = result.get('messages', [])
        if not messages:
            continue
            
        for msg in messages:
            rule = msg.get('ruleId', 'unknown')
            file_errors[file_path][rule] += 1
            total_errors += 1

    print(f"Total Errors: {total_errors}")
    print("-" * 50)
    
    # Sort by total errors per file descending
    sorted_files = sorted(file_errors.items(), key=lambda x: sum(x[1].values()), reverse=True)
    
    for file_path, errors in sorted_files:
        print(f"\n{file_path}: {sum(errors.values())} errors")
        for rule, count in errors.items():
            print(f"  - {rule}: {count}")

except Exception as e:
    print(f"Error analyzing lint results: {e}")
