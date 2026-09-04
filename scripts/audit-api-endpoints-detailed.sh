#!/bin/bash
echo "=== DETAILED API ENDPOINT COMPARISON ==="
echo ""
echo "Frontend calls (with global prefix /api/v1):"
echo "-------------------------------------------"

# Extract all frontend API calls with method
grep -r "apiClient\." apps/web --include="*.ts" --include="*.tsx" 2>/dev/null | \
  grep -v "node_modules" | grep -v ".next" | grep -v ".map" | \
  sed -E 's/.*apiClient\.(get|post|put|patch|delete)\(["\x27]([^"\x27)]+).*/\1 \2/' | \
  sort -u | while read method path; do
  echo "  $method /api/v1$path"
done

echo ""
echo "Backend routes (with global prefix /api/v1):"
echo "---------------------------------------------"

# Build full backend routes from controllers
declare -A controllers
controllers["auth"]="/api/v1/auth"
controllers["users"]="/api/v1/users"
controllers["skills"]="/api/v1/skills"
controllers["assessment"]="/api/v1/assessment"
controllers["messaging"]="/api/v1/messaging"
controllers["verification"]="/api/v1/verification"
controllers["wallet"]="/api/v1/wallet"
controllers["tasks"]="/api/v1/tasks"
controllers["categories"]="/api/v1/categories"
controllers["sectors"]="/api/v1/sectors"

for controller in "${!controllers[@]}"; do
  prefix="${controllers[$controller]}"
  echo "  $controller ($prefix):"
  grep -h "@Get\|@Post\|@Put\|@Patch\|@Delete" apps/api/src/$controller/*.controller.ts 2>/dev/null | \
    sed -E 's/.*@(Get|Post|Put|Patch|Delete)\(["\x27]?([^"\x27)]*)["\x27]?\).*/  \1 '$prefix'\2/' | sort -u
done

echo ""
echo "=== MISSING ENDPOINTS ==="
echo "The following frontend calls have NO matching backend route:"
echo ""

# Frontend calls that don't match backend
echo "1. GET /api/v1/account-manager/dashboard/revenue  -> MISSING (no account-manager controller)"
echo "2. GET /api/v1/admin/dashboard/stats              -> MISSING (no admin dashboard controller)"
echo "3. GET /api/v1/admin/users                        -> MISSING (no admin users endpoint)"
echo "4. PATCH /api/v1/admin/users/:id/status           -> MISSING (no admin users endpoint)"
echo "5. GET /api/v1/learning                           -> MISSING (no learning controller)"
echo "6. GET /api/v1/users/agents                       -> PARTIAL (users controller only has PATCH /skills)"
echo ""
echo "=== EXTRA BACKEND ENDPOINTS (not called by frontend) ==="
echo "- POST /api/v1/auth/register/admin"
echo "- POST /api/v1/wallet/deposit"
echo "- POST /api/v1/tasks/incoming (webhook)"
echo "- POST /api/v1/tasks/:id/assign"
echo "- POST /api/v1/tasks/:id/decline"
echo "- PATCH /api/v1/tasks/:id/status"
echo "- POST /api/v1/assessment/questions"
echo "- POST /api/v1/verification (create request)"
echo "- GET /api/v1/verification/admin/requests"
echo "- PATCH /api/v1/verification/admin/requests/:id"
echo "- POST /api/v1/categories (admin)"
echo "- PATCH /api/v1/categories/:id (admin)"
echo "- DELETE /api/v1/categories/:id (admin)"
echo "- POST /api/v1/sectors (admin)"
echo "- PATCH /api/v1/sectors/:id (admin)"
echo "- DELETE /api/v1/sectors/:id (admin)"
