#!/bin/bash
echo "=== N+1 QUERY AUDIT (Backend) ==="
echo "Searching for potential N+1 query patterns in services..."
echo ""

echo "1. Checking for findAll followed by loops with relations..."
grep -r "findAll\|find.*\[\]" apps/api/src --include="*.service.ts" 2>/dev/null | head -30

echo ""
echo "2. Checking for repository queries in loops (potential N+1)..."
grep -r "for.*of\|forEach\|\.map(" apps/api/src --include="*.service.ts" -A 3 2>/dev/null | grep -E "repository\.|this\.(user|task|wallet|message|conversation|skill|category|sector)" | head -30

echo ""
echo "3. Checking for explicit join/relation loading (good patterns)..."
grep -r "relations:\|join\|leftJoin\|innerJoin\|QueryBuilder" apps/api/src --include="*.service.ts" 2>/dev/null | head -30

echo ""
echo "4. Checking TypeORM find options with relations..."
grep -r "findOne\|findBy" apps/api/src --include="*.service.ts" -A 2 2>/dev/null | grep -E "relations:|where:" | head -20

echo ""
echo "=== N+1 QUERY AUDIT COMPLETE ==="
