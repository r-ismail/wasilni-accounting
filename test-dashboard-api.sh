#!/bin/bash

# Login first
TOKEN=$(curl -s http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "Token: ${TOKEN:0:20}..."
echo ""

# Test each endpoint
echo "=== Testing /api/units ==="
curl -s http://localhost:3001/api/units \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo ""
echo ""

echo "=== Testing /api/customers ==="
curl -s http://localhost:3001/api/customers \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo ""
echo ""

echo "=== Testing /api/contracts ==="
curl -s http://localhost:3001/api/contracts \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo ""
echo ""

echo "=== Testing /api/invoices ==="
curl -s http://localhost:3001/api/invoices \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo ""
echo ""

echo "=== Testing /api/payments ==="
curl -s http://localhost:3001/api/payments \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo ""
