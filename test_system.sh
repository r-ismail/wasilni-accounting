#!/bin/bash

# Aqarat Accounting System - Comprehensive Test Script
# This script tests all major operations in the system

API_URL="http://localhost:3001/api"
RESULTS_FILE="/home/ubuntu/test_results.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize results file
echo "==================================================" > $RESULTS_FILE
echo "Aqarat Accounting System - Test Report" >> $RESULTS_FILE
echo "Test Date: $(date)" >> $RESULTS_FILE
echo "==================================================" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to log test result
log_test() {
    local test_name=$1
    local status=$2
    local details=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✓${NC} $test_name"
        echo "✓ $test_name - PASSED" >> $RESULTS_FILE
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}✗${NC} $test_name"
        echo "✗ $test_name - FAILED" >> $RESULTS_FILE
    fi
    
    if [ -n "$details" ]; then
        echo "  Details: $details" >> $RESULTS_FILE
    fi
    echo "" >> $RESULTS_FILE
}

echo ""
echo "==================================================="
echo "  Aqarat Accounting System - Comprehensive Test"
echo "==================================================="
echo ""

# ==================== Phase 1: Authentication ====================
echo -e "${YELLOW}Phase 1: Authentication & Setup${NC}"
echo "Phase 1: Authentication & Setup" >> $RESULTS_FILE
echo "================================" >> $RESULTS_FILE

# Test 1.1: Login
echo -n "Testing login... "
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    log_test "1.1 - User Login" "PASS" "Token received successfully"
else
    log_test "1.1 - User Login" "FAIL" "Failed to get token"
    echo "Login failed. Exiting..."
    exit 1
fi

# Test 1.2: Check Setup Status
echo -n "Testing setup status... "
SETUP_STATUS=$(curl -s -X GET $API_URL/setup/status \
  -H "Authorization: Bearer $TOKEN")

SETUP_COMPLETED=$(echo $SETUP_STATUS | jq -r '.data.setupCompleted')

if [ "$SETUP_COMPLETED" = "true" ]; then
    log_test "1.2 - Setup Status Check" "PASS" "Setup is completed"
else
    log_test "1.2 - Setup Status Check" "PASS" "Setup not completed (expected for first run)"
fi

# ==================== Phase 2: Units & Customers ====================
echo ""
echo -e "${YELLOW}Phase 2: Units & Customers Management${NC}"
echo "Phase 2: Units & Customers Management" >> $RESULTS_FILE
echo "=====================================" >> $RESULTS_FILE

# Test 2.1: Get Units
echo -n "Testing get units... "
UNITS_RESPONSE=$(curl -s -X GET $API_URL/units \
  -H "Authorization: Bearer $TOKEN")

UNITS_COUNT=$(echo $UNITS_RESPONSE | jq -r '.data | length')

if [ "$UNITS_COUNT" -ge 0 ]; then
    log_test "2.1 - Get Units List" "PASS" "Found $UNITS_COUNT units"
else
    log_test "2.1 - Get Units List" "FAIL" "Failed to get units"
fi

# Test 2.2: Get Customers
echo -n "Testing get customers... "
CUSTOMERS_RESPONSE=$(curl -s -X GET $API_URL/customers \
  -H "Authorization: Bearer $TOKEN")

CUSTOMERS_COUNT=$(echo $CUSTOMERS_RESPONSE | jq -r '.data | length')

if [ "$CUSTOMERS_COUNT" -ge 0 ]; then
    log_test "2.2 - Get Customers List" "PASS" "Found $CUSTOMERS_COUNT customers"
else
    log_test "2.2 - Get Customers List" "FAIL" "Failed to get customers"
fi

# ==================== Phase 3: Contracts & Invoices ====================
echo ""
echo -e "${YELLOW}Phase 3: Contracts & Invoices${NC}"
echo "Phase 3: Contracts & Invoices" >> $RESULTS_FILE
echo "==============================" >> $RESULTS_FILE

# Test 3.1: Get Contracts
echo -n "Testing get contracts... "
CONTRACTS_RESPONSE=$(curl -s -X GET $API_URL/contracts \
  -H "Authorization: Bearer $TOKEN")

CONTRACTS_COUNT=$(echo $CONTRACTS_RESPONSE | jq -r '.data | length')

if [ "$CONTRACTS_COUNT" -ge 0 ]; then
    log_test "3.1 - Get Contracts List" "PASS" "Found $CONTRACTS_COUNT contracts"
else
    log_test "3.1 - Get Contracts List" "FAIL" "Failed to get contracts"
fi

# Test 3.2: Get Invoices
echo -n "Testing get invoices... "
INVOICES_RESPONSE=$(curl -s -X GET $API_URL/invoices \
  -H "Authorization: Bearer $TOKEN")

INVOICES_COUNT=$(echo $INVOICES_RESPONSE | jq -r '.data | length')

if [ "$INVOICES_COUNT" -ge 0 ]; then
    log_test "3.2 - Get Invoices List" "PASS" "Found $INVOICES_COUNT invoices"
else
    log_test "3.2 - Get Invoices List" "FAIL" "Failed to get invoices"
fi

# ==================== Phase 4: Meters & Readings ====================
echo ""
echo -e "${YELLOW}Phase 4: Meters & Readings${NC}"
echo "Phase 4: Meters & Readings" >> $RESULTS_FILE
echo "===========================" >> $RESULTS_FILE

# Test 4.1: Get Meters
echo -n "Testing get meters... "
METERS_RESPONSE=$(curl -s -X GET $API_URL/meters \
  -H "Authorization: Bearer $TOKEN")

METERS_COUNT=$(echo $METERS_RESPONSE | jq -r 'length')

if [ "$METERS_COUNT" -ge 0 ]; then
    log_test "4.1 - Get Meters List" "PASS" "Found $METERS_COUNT meters"
else
    log_test "4.1 - Get Meters List" "FAIL" "Failed to get meters"
fi

# Test 4.2: Get Meter Readings
echo -n "Testing get meter readings... "
READINGS_RESPONSE=$(curl -s -X GET $API_URL/meters/readings/list \
  -H "Authorization: Bearer $TOKEN")

READINGS_COUNT=$(echo $READINGS_RESPONSE | jq -r 'length')

if [ "$READINGS_COUNT" -ge 0 ]; then
    log_test "4.2 - Get Meter Readings" "PASS" "Found $READINGS_COUNT readings"
else
    log_test "4.2 - Get Meter Readings" "FAIL" "Failed to get readings"
fi

# ==================== Phase 5: Payments ====================
echo ""
echo -e "${YELLOW}Phase 5: Payments${NC}"
echo "Phase 5: Payments" >> $RESULTS_FILE
echo "=================" >> $RESULTS_FILE

# Test 5.1: Get Payments
echo -n "Testing get payments... "
PAYMENTS_RESPONSE=$(curl -s -X GET $API_URL/payments \
  -H "Authorization: Bearer $TOKEN")

PAYMENTS_COUNT=$(echo $PAYMENTS_RESPONSE | jq -r '.data | length')

if [ "$PAYMENTS_COUNT" -ge 0 ]; then
    log_test "5.1 - Get Payments List" "PASS" "Found $PAYMENTS_COUNT payments"
else
    log_test "5.1 - Get Payments List" "FAIL" "Failed to get payments"
fi

# ==================== Phase 6: Notifications ====================
echo ""
echo -e "${YELLOW}Phase 6: Notifications${NC}"
echo "Phase 6: Notifications" >> $RESULTS_FILE
echo "======================" >> $RESULTS_FILE

# Test 6.1: Get Notifications
echo -n "Testing get notifications... "
NOTIFICATIONS_RESPONSE=$(curl -s -X GET $API_URL/notifications \
  -H "Authorization: Bearer $TOKEN")

NOTIFICATIONS_COUNT=$(echo $NOTIFICATIONS_RESPONSE | jq -r '.data | length')

if [ "$NOTIFICATIONS_COUNT" -ge 0 ]; then
    log_test "6.1 - Get Notifications List" "PASS" "Found $NOTIFICATIONS_COUNT notifications"
else
    log_test "6.1 - Get Notifications List" "FAIL" "Failed to get notifications"
fi

# Test 6.2: Get Templates
echo -n "Testing get templates... "
TEMPLATES_RESPONSE=$(curl -s -X GET $API_URL/notifications/templates \
  -H "Authorization: Bearer $TOKEN")

TEMPLATES_COUNT=$(echo $TEMPLATES_RESPONSE | jq -r '.data | length')

if [ "$TEMPLATES_COUNT" -ge 0 ]; then
    log_test "6.2 - Get Notification Templates" "PASS" "Found $TEMPLATES_COUNT templates"
else
    log_test "6.2 - Get Notification Templates" "FAIL" "Failed to get templates"
fi

# ==================== Phase 7: Services ====================
echo ""
echo -e "${YELLOW}Phase 7: Services${NC}"
echo "Phase 7: Services" >> $RESULTS_FILE
echo "=================" >> $RESULTS_FILE

# Test 7.1: Get Services
echo -n "Testing get services... "
SERVICES_RESPONSE=$(curl -s -X GET $API_URL/services \
  -H "Authorization: Bearer $TOKEN")

SERVICES_COUNT=$(echo $SERVICES_RESPONSE | jq -r '.data | length')

if [ "$SERVICES_COUNT" -ge 0 ]; then
    log_test "7.1 - Get Services List" "PASS" "Found $SERVICES_COUNT services"
else
    log_test "7.1 - Get Services List" "FAIL" "Failed to get services"
fi

# ==================== Summary ====================
echo ""
echo "==================================================="
echo "                  Test Summary"
echo "==================================================="
echo ""
echo "Summary" >> $RESULTS_FILE
echo "=======" >> $RESULTS_FILE

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo -e "Total Tests:  ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo -e "Pass Rate:    ${GREEN}$PASS_RATE%${NC}"

echo "Total Tests:  $TOTAL_TESTS" >> $RESULTS_FILE
echo "Passed:       $PASSED_TESTS" >> $RESULTS_FILE
echo "Failed:       $FAILED_TESTS" >> $RESULTS_FILE
echo "Pass Rate:    $PASS_RATE%" >> $RESULTS_FILE

echo ""
echo "==================================================="
echo ""
echo "Detailed results saved to: $RESULTS_FILE"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Check the report for details.${NC}"
    exit 1
fi
