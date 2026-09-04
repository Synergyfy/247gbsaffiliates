#!/bin/bash
echo "=== MOCK DATA AUDIT ==="
echo "Searching for mock data patterns in frontend (excluding .next)..."
echo ""

# Check for common mock patterns
echo "1. Checking for 'mock' keyword (case-insensitive)..."
grep -r -i "mock" apps/web/src apps/web/app apps/web/components apps/web/hooks apps/web/lib apps/web/store 2>/dev/null | grep -v ".d.ts" | grep -v "node_modules" | grep -v "test" | grep -v "spec" | grep -v ".map" | grep -v ".next" || echo "  No mock patterns found"

echo ""
echo "2. Checking for hardcoded test/fake data..."
grep -r -E "(FAKE|fake|TEST_DATA|testData|dummy|DUMMY|placeholder|PLACEHOLDER)" apps/web/src apps/web/app apps/web/components apps/web/hooks apps/web/lib apps/web/store 2>/dev/null | grep -v ".d.ts" | grep -v "node_modules" | grep -v "test" | grep -v "spec" | grep -v ".map" | grep -v ".next" | grep -v "placeholder=" || echo "  No fake data patterns found"

echo ""
echo "3. Checking for hardcoded arrays/objects that look like mock responses..."
grep -r -E "\[\s*\{\s*(id|name|title|email):" apps/web/src apps/web/app apps/web/components apps/web/hooks apps/web/lib apps/web/store 2>/dev/null | grep -v ".d.ts" | grep -v "node_modules" | grep -v "test" | grep -v "spec" | grep -v ".map" | grep -v ".next" || echo "  No inline mock arrays found"

echo ""
echo "4. Checking for MSW (Mock Service Worker) or similar..."
grep -r -E "msw|MockServiceWorker|setupWorker|rest\." apps/web 2>/dev/null | grep -v "node_modules" | grep -v ".map" | grep -v ".next" || echo "  No MSW found"

echo ""
echo "=== MOCK DATA AUDIT COMPLETE ==="
