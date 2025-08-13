#!/bin/bash
# Fix test duplicates in qa-engine.test.ts

# Create backup
cp lib/services/__tests__/qa-engine.test.ts lib/services/__tests__/qa-engine.test.ts.backup

# Count duplicates
echo "Found duplicate describe blocks at lines:"
grep -n "describe('Generate Checklist'" lib/services/__tests__/qa-engine.test.ts

# Remove duplicate describe blocks (keeping first one)
# Lines to remove: 58-83, 144-169, 205-230, 282-307, 347-372, 390-415
sed -i '58,83d; 144,169d; 205,230d; 282,307d; 347,372d; 390,415d' lib/services/__tests__/qa-engine.test.ts

echo "Duplicates removed successfully"
