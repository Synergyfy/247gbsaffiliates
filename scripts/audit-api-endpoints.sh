#!/bin/bash
echo "=== API ENDPOINT AUDIT ==="
echo "Comparing frontend API calls vs backend routes..."
echo ""

# Extract frontend API calls
echo "1. Frontend API calls found:"
grep -r "apiClient\." apps/web --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -v ".map" | sed -E 's/.*apiClient\.(get|post|put|patch|delete)\(["\x27]([^"\x27)]+).*/\1 \2/' | sort -u

echo ""
echo "2. Backend routes (controllers):"
find apps/api/src -name "*.controller.ts" -exec grep -h "@Get\|@Post\|@Put\|@Patch\|@Delete" {} \; 2>/dev/null | sed -E 's/.*@(Get|Post|Put|Patch|Delete)\(["\x27]?([^"\x27)]*)["\x27]?\).*/\1 \2/' | sort -u

echo ""
echo "3. Backend global prefix (from main.ts):"
grep -E "setGlobalPrefix" apps/api/src/main.ts 2>/dev/null || echo "  Not found"

echo ""
echo "=== API ENDPOINT AUDIT COMPLETE ==="
