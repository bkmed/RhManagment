#!/bin/bash

# Script to replace all Alert.alert with Toast/Modal notifications
# Usage: ./replace-alerts.sh

echo "Replacing Alert.alert() calls with Toast notifications..."

# Find all TypeScript files with Alert usage
files=$(grep -rl "Alert\.alert" src/screens --include="*.tsx" --include="*.ts")

for file in $files; do
    echo "Processing: $file"
    
    # Replace Alert import - remove Alert from react-native imports
    sed -i '' 's/, Alert,/,/g' "$file"
    sed -i '' 's/Alert,//g' "$file"
    
    # Add useToast and useModal imports if not present
    if ! grep -q "useToast" "$file"; then
        # Add after other context imports
        sed -i '' '/useAuth.*from.*AuthContext/a\
import { useToast } from '\''../../context/ToastContext'\'';
' "$file"
    fi
    
    # Simple error alerts → Toast
    sed -i '' "s/Alert\.alert(t('common\.error'), \(.*\));/showToast(\1, 'error');/g" "$file"
    
    # Success alerts → Toast  
    sed -i '' "s/Alert\.alert(t('common\.success'), \(.*\));/showToast(\1, 'success');/g" "$file"
    
    # Simple single-arg alerts → Toast info
    sed -i '' "s/Alert\.alert(\(t([^)]*)\));/showToast(\1, 'info');/g" "$file"
    
done

echo "✅ Done! Updated ${#files[@]} files"
echo "⚠️  Please manually review confirmation dialogs (ones with buttons)"
