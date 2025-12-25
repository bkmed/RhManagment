#!/usr/bin/env python3
"""
Replace all Alert.alert calls with Toast/Modal notifications
"""
import os
import re
from pathlib import Path

def process_file(filepath):
    """Process a single TypeScript file to replace Alert.alert calls"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    modified = False
    
    # Track if file uses Alert
    if 'Alert.alert' not in content:
        return False
    
    print(f"Processing: {filepath}")
    
    # Remove Alert from imports
    content = re.sub(r',\s*Alert\s*,', ',', content)
    content = re.sub(r'Alert\s*,', '', content)
    content = re.sub(r',\s*Alert\s*}', '}', content)
    
    # Add useToast import if not present
    if 'useToast' not in content and 'Alert.alert' in content:
        # Find import from AuthContext and add after it
        auth_import = re.search(r"(import.*useAuth.*from.*['\"].*AuthContext['\"];?)", content)
        if auth_import:
            insert_pos = auth_import.end()
            toast_import = "\nimport { useToast } from '../../context/ToastContext';"
            content = content[:insert_pos] + toast_import + content[insert_pos:]
    
    # Add useModal import if file has confirmation dialogs
    if 'Alert.alert' in content and re.search(r'Alert\.alert\([^,]+,[^,]+,\s*\[', content):
        auth_import = re.search(r"(import.*useToast.*from.*['\"].*ToastContext['\"];?)", content)
        if auth_import and 'useModal' not in content:
            insert_pos = auth_import.end()
            modal_import = "\nimport { useModal } from '../../context/ModalContext';"
            content = content[:insert_pos] + modal_import + content[insert_pos:]
    
    # Add const { showToast } = useToast() if not present
    if 'useToast' in content and 'showToast' not in content:
        # Find component start
        component_match = re.search(r'(export (?:const|function) \w+.*?\{[^}]*?const \{ [^}]+ \} = use\w+\(\);)', content, re.DOTALL)
        if component_match:
            insert_pos = component_match.end()
            toast_hook = "\n  const { showToast } = useToast();"
            content = content[:insert_pos] + toast_hook + content[insert_pos:]
    
    # Replace simple error alerts
    content = re.sub(
        r"Alert\.alert\(t\(['\"]common\.error['\"]\),\s*([^)]+)\);",
        r"showToast(\1, 'error');",
        content
    )
    
    # Replace simple success alerts
    content = re.sub(
        r"Alert\.alert\(t\(['\"]common\.success['\"]\),\s*([^)]+)\);",
        r"showToast(\1, 'success');",
        content
    )
    
    # Replace single-param info alerts
    content = re.sub(
        r"Alert\.alert\((t\([^)]+\))\);",
        r"showToast(\1, 'info');",
        content
    )
    
    # Replace two-param info alerts (title, message)
    content = re.sub(
        r"Alert\.alert\(([^,]+),\s*([^,\)]+)\);",
        r"showToast(\2, 'info');",
        content
    )
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated {filepath}")
        return True
    
    return False

def main():
    """Main function to process all screen files"""
    src_dir = Path('src/screens')
    files_processed = 0
    files_updated = 0
    
    for tsx_file in src_dir.rglob('*.tsx'):
        files_processed += 1
        if process_file(tsx_file):
            files_updated += 1
    
    print(f"\n✅ Processed {files_processed} files, updated {files_updated} files")
    print("⚠️  Note: Confirmation dialogs with buttons need manual conversion to useModal()")

if __name__ == '__main__':
    main()
