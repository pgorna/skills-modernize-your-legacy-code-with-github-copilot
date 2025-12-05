# Student Account Management System - Test Plan

## Overview

This test plan validates the business logic and implementation of the Student Account Management System. It covers all operations including balance inquiries, credit transactions, debit transactions, input validation, and business rule enforcement.

**Version:** 1.0  
**Date:** December 5, 2025  
**System Under Test:** Student Account Management System (COBOL Legacy Application)  
**Purpose:** Validation with business stakeholders and basis for Node.js migration testing

---

## Test Scope

- Account initialization
- Balance inquiry operations
- Credit (deposit) transactions
- Debit (withdrawal) transactions
- Overdraft protection validation
- Input validation and error handling
- Menu navigation and user interface
- Data persistence across operations

---

## Test Cases

### 1. Account Initialization Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-INIT-001 | Verify default account balance on system start | System not yet started | 1. Start application; 2. Select option 1 (View Balance) | Display shows: "Current balance: 1000.00" | | | Default balance should be $1,000.00 |
| TC-INIT-002 | Verify account balance format | System started | 1. View balance | Balance displayed with 2 decimal places (e.g., 1000.00, not 1000 or 1000.0) | | | Ensures proper currency formatting |

---

### 2. Balance Inquiry Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-BAL-001 | View initial balance | System started with default balance | 1. Select option 1 (View Balance) | System displays: "Current balance: 1000.00" | | | Read-only operation |
| TC-BAL-002 | View balance after credit transaction | Balance credited with $500.00 | 1. Select option 1 (View Balance) | System displays updated balance: "Current balance: 1500.00" | | | Verifies balance persistence |
| TC-BAL-003 | View balance after debit transaction | Balance debited by $250.00 | 1. Select option 1 (View Balance) | System displays updated balance: "Current balance: 750.00" | | | Verifies balance updates |
| TC-BAL-004 | View balance does not modify account | Starting balance: $1000.00 | 1. Select option 1 multiple times; 2. View balance again | Balance remains unchanged at $1000.00 | | | Confirms read-only nature |
| TC-BAL-005 | View balance at maximum limit | Balance set to $999,999.99 | 1. Select option 1 (View Balance) | System displays: "Current balance: 999999.99" | | | Tests maximum value handling |
| TC-BAL-006 | View balance at minimum (zero) | Balance set to $0.00 | 1. Select option 1 (View Balance) | System displays: "Current balance: 0.00" or "Current balance: .00" | | | Tests minimum value handling |

---

### 3. Credit Transaction Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-CRD-001 | Credit account with valid amount | Starting balance: $1000.00 | 1. Select option 2 (Credit Account); 2. Enter amount: 500.00; 3. Confirm transaction | System displays: "Amount credited. New balance: 1500.00" | | | Basic credit operation |
| TC-CRD-002 | Credit account with small amount | Starting balance: $1000.00 | 1. Select option 2; 2. Enter amount: 0.01 | System displays: "Amount credited. New balance: 1000.01" | | | Tests minimum credit amount |
| TC-CRD-003 | Credit account with large amount | Starting balance: $1000.00 | 1. Select option 2; 2. Enter amount: 100000.00 | System displays: "Amount credited. New balance: 101000.00" | | | Tests large transaction |
| TC-CRD-004 | Credit account with decimal precision | Starting balance: $1000.00 | 1. Select option 2; 2. Enter amount: 123.45 | System displays: "Amount credited. New balance: 1123.45" | | | Verifies decimal handling |
| TC-CRD-005 | Credit account to maximum balance | Starting balance: $500,000.00 | 1. Select option 2; 2. Enter amount: 499999.99 | System displays: "Amount credited. New balance: 999999.99" | | | Tests upper boundary |
| TC-CRD-006 | Credit account exceeding maximum | Starting balance: $999,000.00 | 1. Select option 2; 2. Enter amount: 2000.00 | System accepts or displays overflow error (behavior to be validated) | | | Tests boundary condition |
| TC-CRD-007 | Credit with zero amount | Starting balance: $1000.00 | 1. Select option 2; 2. Enter amount: 0.00 | System accepts with no change or rejects (behavior to be validated) | | | Edge case validation |
| TC-CRD-008 | Multiple consecutive credits | Starting balance: $1000.00 | 1. Credit $100.00; 2. Credit $200.00; 3. Credit $300.00; 4. View balance | Final balance: $1600.00 | | | Tests transaction accumulation |
| TC-CRD-009 | Credit after viewing balance | Starting balance: $1000.00 | 1. View balance; 2. Credit $500.00; 3. View balance | Balance increases from $1000.00 to $1500.00 | | | Tests operation sequencing |

---

### 4. Debit Transaction Tests (Sufficient Funds)

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-DEB-001 | Debit account with valid amount | Starting balance: $1000.00 | 1. Select option 3 (Debit Account); 2. Enter amount: 500.00 | System displays: "Amount debited. New balance: 500.00" | | | Basic debit operation |
| TC-DEB-002 | Debit account with small amount | Starting balance: $1000.00 | 1. Select option 3; 2. Enter amount: 0.01 | System displays: "Amount debited. New balance: 999.99" | | | Tests minimum debit amount |
| TC-DEB-003 | Debit account with decimal precision | Starting balance: $1000.00 | 1. Select option 3; 2. Enter amount: 123.45 | System displays: "Amount debited. New balance: 876.55" | | | Verifies decimal handling |
| TC-DEB-004 | Debit exact balance amount | Starting balance: $1000.00 | 1. Select option 3; 2. Enter amount: 1000.00 | System displays: "Amount debited. New balance: 0.00" | | | Tests exact balance withdrawal |
| TC-DEB-005 | Debit leaving minimum balance | Starting balance: $1000.00 | 1. Select option 3; 2. Enter amount: 999.99 | System displays: "Amount debited. New balance: 0.01" | | | Tests near-zero balance |
| TC-DEB-006 | Multiple consecutive debits | Starting balance: $1000.00 | 1. Debit $100.00; 2. Debit $200.00; 3. Debit $300.00; 4. View balance | Final balance: $400.00 | | | Tests transaction accumulation |
| TC-DEB-007 | Debit after credit transaction | Starting balance: $1000.00 | 1. Credit $500.00; 2. Debit $300.00; 3. View balance | Final balance: $1200.00 | | | Tests mixed operations |

---

### 5. Debit Transaction Tests (Insufficient Funds - Overdraft Protection)

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-OVD-001 | Attempt debit exceeding balance | Starting balance: $1000.00 | 1. Select option 3; 2. Enter amount: 1500.00 | System displays: "Insufficient funds for this debit." and balance remains $1000.00 | | | **Critical business rule** |
| TC-OVD-002 | Attempt debit slightly over balance | Starting balance: $1000.00 | 1. Select option 3; 2. Enter amount: 1000.01 | System displays: "Insufficient funds for this debit." and balance remains $1000.00 | | | Tests precision in validation |
| TC-OVD-003 | Attempt debit with zero balance | Starting balance: $0.00 | 1. Select option 3; 2. Enter amount: 0.01 | System displays: "Insufficient funds for this debit." and balance remains $0.00 | | | Tests minimum balance protection |
| TC-OVD-004 | Verify balance unchanged after failed debit | Starting balance: $1000.00 | 1. Attempt debit $2000.00 (fails); 2. View balance | Balance still shows $1000.00 | | | Confirms transaction rollback |
| TC-OVD-005 | Multiple insufficient funds attempts | Starting balance: $500.00 | 1. Attempt debit $600.00 (fails); 2. Attempt debit $700.00 (fails); 3. View balance | Balance remains $500.00 after all attempts | | | Tests repeated failures |
| TC-OVD-006 | Successful debit after failed attempt | Starting balance: $1000.00 | 1. Attempt debit $1500.00 (fails); 2. Debit $500.00 (succeeds); 3. View balance | Final balance: $500.00 | | | Validates system recovery |
| TC-OVD-007 | Large overdraft attempt | Starting balance: $1000.00 | 1. Select option 3; 2. Enter amount: 999999.99 | System displays: "Insufficient funds for this debit." and balance remains $1000.00 | | | Tests extreme values |

---

### 6. Menu Navigation and User Interface Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-UI-001 | Display main menu on startup | Application started | 1. Observe initial screen | Menu displays with options 1-4: View Balance, Credit Account, Debit Account, Exit | | | UI consistency check |
| TC-UI-002 | Return to menu after viewing balance | At main menu | 1. Select option 1; 2. Observe screen | Balance displayed, then menu re-appears | | | Menu persistence |
| TC-UI-003 | Return to menu after credit | At main menu | 1. Select option 2; 2. Enter amount; 3. Observe screen | Confirmation displayed, then menu re-appears | | | Transaction flow |
| TC-UI-004 | Return to menu after debit | At main menu | 1. Select option 3; 2. Enter amount; 3. Observe screen | Result displayed, then menu re-appears | | | Transaction flow |
| TC-UI-005 | Menu loop continues until exit | At main menu | 1. Perform option 1; 2. Perform option 2; 3. Perform option 3; 4. Verify menu redisplays each time | Menu continuously redisplays after each operation | | | Application flow |
| TC-UI-006 | Exit application gracefully | At main menu | 1. Select option 4 (Exit) | System displays: "Exiting the program. Goodbye!" and application terminates | | | Clean shutdown |

---

### 7. Input Validation Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-VAL-001 | Invalid menu choice (too high) | At main menu | 1. Enter choice: 5 | System displays: "Invalid choice, please select 1-4." and menu redisplays | | | Boundary validation |
| TC-VAL-002 | Invalid menu choice (too low) | At main menu | 1. Enter choice: 0 | System displays: "Invalid choice, please select 1-4." and menu redisplays | | | Boundary validation |
| TC-VAL-003 | Invalid menu choice (letter) | At main menu | 1. Enter choice: A | System displays error or handles gracefully | | | Non-numeric input handling |
| TC-VAL-004 | Invalid menu choice (special char) | At main menu | 1. Enter choice: @ | System displays error or handles gracefully | | | Special character handling |
| TC-VAL-005 | Empty menu input | At main menu | 1. Press Enter without input | System displays error or re-prompts | | | Empty input handling |
| TC-VAL-006 | Negative amount for credit | At credit prompt | 1. Select option 2; 2. Enter amount: -100.00 | System rejects or handles gracefully | | | Negative value validation |
| TC-VAL-007 | Negative amount for debit | At debit prompt | 1. Select option 3; 2. Enter amount: -100.00 | System rejects or handles gracefully | | | Negative value validation |
| TC-VAL-008 | Non-numeric amount for credit | At credit prompt | 1. Select option 2; 2. Enter amount: ABC | System displays error or handles gracefully | | | Type validation |
| TC-VAL-009 | Non-numeric amount for debit | At debit prompt | 1. Select option 3; 2. Enter amount: XYZ | System displays error or handles gracefully | | | Type validation |
| TC-VAL-010 | Amount with excessive decimals | At transaction prompt | 1. Select option 2; 2. Enter amount: 100.999 | System rounds or truncates to 2 decimals | | | Decimal precision handling |

---

### 8. Data Persistence and Consistency Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-PER-001 | Balance persists across operations | Starting balance: $1000.00 | 1. Credit $500.00; 2. View balance; 3. Debit $200.00; 4. View balance | Balance shows $1500.00 after step 2 and $1300.00 after step 4 | | | Data consistency |
| TC-PER-002 | Failed debit does not affect balance | Starting balance: $1000.00 | 1. View balance ($1000.00); 2. Attempt debit $2000.00 (fails); 3. View balance | Balance remains $1000.00 throughout | | | Transaction atomicity |
| TC-PER-003 | Balance accuracy with multiple operations | Starting balance: $1000.00 | 1. Credit $250.00; 2. Debit $100.00; 3. Credit $50.00; 4. Debit $200.00; 5. View balance | Final balance: $1000.00 | | | Calculation accuracy |
| TC-PER-004 | Read operation does not modify data | Starting balance: $1000.00 | 1. View balance 10 times; 2. Verify balance | Balance remains exactly $1000.00 | | | Read-only integrity |
| TC-PER-005 | Concurrent read and write operations | Starting balance: $1000.00 | 1. View balance; 2. Credit $100.00; 3. View balance immediately | Balance correctly updates from $1000.00 to $1100.00 | | | Real-time consistency |

---

### 9. Business Rule Validation Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-BIZ-001 | Initial balance is $1000.00 | Fresh system start | 1. Start application; 2. View balance | Balance is exactly $1000.00 | | | Business requirement |
| TC-BIZ-002 | No overdrafts allowed | Any balance | 1. Attempt to debit more than current balance | Transaction rejected with error message | | | **Critical business rule** |
| TC-BIZ-003 | Minimum balance can be $0.00 | Balance: $100.00 | 1. Debit $100.00 | Balance becomes $0.00, transaction succeeds | | | Lower boundary |
| TC-BIZ-004 | Maximum balance is $999,999.99 | Balance near maximum | 1. Verify system handles maximum value | System correctly stores and displays maximum | | | Upper boundary |
| TC-BIZ-005 | All amounts use 2 decimal places | Any balance | 1. Perform various operations; 2. View balances | All displayed amounts have exactly 2 decimal places | | | Currency standard |
| TC-BIZ-006 | Credits have no maximum limit | Balance: $1000.00 | 1. Credit $900,000.00 | Transaction succeeds (within system max) | | | Business requirement |
| TC-BIZ-007 | Debits require sufficient funds | Balance: $500.00 | 1. Can debit $500.00 or less; 2. Cannot debit $500.01 or more | Exact or lesser debits succeed, greater amounts fail | | | Overdraft protection |

---

### 10. End-to-End Scenario Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-E2E-001 | Complete student account lifecycle | New account | 1. Start application (balance: $1000.00); 2. Credit tuition deposit $5000.00; 3. Debit books payment $350.00; 4. Debit housing $2000.00; 5. View final balance; 6. Exit | Final balance: $3650.00 and application exits cleanly | | | Real-world scenario |
| TC-E2E-002 | Student with insufficient funds scenario | Balance: $1000.00 | 1. View balance; 2. Attempt debit $1500.00 (fails); 3. Credit $1000.00; 4. Debit $1500.00 (succeeds); 5. View balance | Final balance: $500.00 | | | Common use case |
| TC-E2E-003 | Multiple students sequential access | Clean system | 1. Student A: Credit $2000, Debit $500; 2. Exit and restart; 3. Student B session starts with $1000.00 | Each session independent (or continues if persistent) | | | Multi-user consideration |
| TC-E2E-004 | Account depleted to zero | Balance: $750.00 | 1. Debit $250.00; 2. Debit $500.00; 3. View balance; 4. Attempt debit $0.01 (fails) | Final balance: $0.00 and cannot withdraw from empty account | | | Edge case scenario |
| TC-E2E-005 | Maximum transactions in session | Balance: $1000.00 | 1. Perform 20 alternating credits and debits; 2. View final balance | All transactions process correctly and final balance mathematically correct | | | Load/stress test |

---

## Test Execution Notes

### For Business Stakeholders

1. **Critical Business Rules to Validate:**
   - Accounts start with $1,000.00 balance
   - Overdrafts are NOT permitted (insufficient funds protection)
   - All monetary values display with 2 decimal places
   - Balance can reach $0.00 but never go negative

2. **Questions for Business Validation:**
   - Should there be a minimum balance requirement above $0.00?
   - Should there be daily transaction limits?
   - Should zero-amount transactions be allowed?
   - Should there be maximum withdrawal/deposit limits per transaction?
   - How should the system handle invalid input (letters, special characters)?
   - Should there be transaction logging/history?

3. **Priority Test Cases:**
   - **HIGH:** TC-OVD-001 (Overdraft protection)
   - **HIGH:** TC-DEB-004 (Exact balance withdrawal)
   - **HIGH:** TC-INIT-001 (Initial balance)
   - **HIGH:** TC-PER-002 (Failed transaction does not modify balance)
   - **MEDIUM:** All other debit/credit operations
   - **LOW:** UI and error message validation

---

## Test Environment

- **Application:** Student Account Management System (COBOL)
- **Compiler:** GnuCOBOL (cobc)
- **Platform:** Linux/Unix environment
- **Executable:** `./accountsystem`

---

## Success Criteria

- All HIGH priority test cases must pass
- Overdraft protection must function correctly (no negative balances)
- Balance calculations must be accurate to 2 decimal places
- All operations must maintain data consistency
- Invalid input must be handled gracefully without system crashes

---

## Migration to Node.js

This test plan will be used to:

1. Create unit tests for business logic layer
2. Create integration tests for data persistence
3. Validate that Node.js implementation matches COBOL behavior
4. Ensure business rules are preserved during migration
5. Provide regression testing suite for new implementation

**Recommended Testing Framework for Node.js:**

- Jest or Mocha for unit tests
- Supertest for integration/API tests
- Test coverage target: 90%+ for business logic

---

## Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Analyst | | | |
| QA Lead | | | |
| Product Owner | | | |
| Technical Lead | | | |

---

**Document Control:**

- **Version:** 1.0
- **Created:** December 5, 2025
- **Last Updated:** December 5, 2025
- **Next Review:** Upon completion of Node.js migration
