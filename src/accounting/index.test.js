/**
 * Unit tests for Student Account Management System
 * Tests based on TESTPLAN.md business requirements
 * 
 * Test Coverage:
 * - Account Initialization (TC-INIT-*)
 * - Balance Inquiry (TC-BAL-*)
 * - Credit Transactions (TC-CRD-*)
 * - Debit Transactions (TC-DEB-*)
 * - Overdraft Protection (TC-OVD-*)
 * - Input Validation (TC-VAL-*)
 * - Data Persistence (TC-PER-*)
 * - Business Rules (TC-BIZ-*)
 * - End-to-End Scenarios (TC-E2E-*)
 */

const { DataProgram, Operations } = require('./index');

describe('DataProgram - Data Persistence Layer', () => {
    let dataProgram;

    beforeEach(() => {
        dataProgram = new DataProgram();
    });

    test('TC-INIT-001: Should initialize with default balance of 1000.00', () => {
        expect(dataProgram.read()).toBe(1000.00);
    });

    test('Should read the current balance', () => {
        const balance = dataProgram.read();
        expect(balance).toBe(1000.00);
    });

    test('Should write and persist new balance', () => {
        dataProgram.write(1500.50);
        expect(dataProgram.read()).toBe(1500.50);
    });

    test('Should handle maximum balance', () => {
        dataProgram.write(999999.99);
        expect(dataProgram.read()).toBe(999999.99);
    });

    test('Should handle minimum balance (zero)', () => {
        dataProgram.write(0.00);
        expect(dataProgram.read()).toBe(0.00);
    });
});

describe('Operations - Business Logic Layer', () => {
    let dataProgram;
    let operations;

    beforeEach(() => {
        dataProgram = new DataProgram();
        operations = new Operations(dataProgram);
    });

    describe('Balance Formatting', () => {
        test('TC-INIT-002: Should format balance with 2 decimal places', () => {
            const formatted = operations.formatBalance(1000.00);
            expect(formatted).toMatch(/^\d+\.\d{2}$/);
            expect(formatted).toBe('001000.00');
        });

        test('Should pad balance to 9 characters', () => {
            expect(operations.formatBalance(100.50)).toBe('000100.50');
            expect(operations.formatBalance(1.99)).toBe('000001.99');
        });
    });

    describe('Credit Operations', () => {
        test('TC-CRD-001: Should credit valid amount to account', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('500.00')
            };

            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1500.00);
        });

        test('TC-CRD-002: Should handle small credit amounts', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('0.01')
            };

            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1000.01);
        });

        test('TC-CRD-004: Should handle decimal precision correctly', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('123.45')
            };

            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1123.45);
        });

        test('Should reject negative amounts', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('-100')
            };

            const initialBalance = dataProgram.read();
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(initialBalance); // Balance unchanged
        });
    });

    describe('Debit Operations', () => {
        test('TC-DEB-001: Should debit valid amount from account', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('500.00')
            };

            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(500.00);
        });

        test('TC-DEB-004: Should allow exact balance withdrawal', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('1000.00')
            };

            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(0.00);
        });

        test('TC-DEB-005: Should handle near-zero balance', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('999.99')
            };

            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(0.01);
        });
    });

    describe('Overdraft Protection', () => {
        test('TC-OVD-001: Should reject debit exceeding balance (CRITICAL)', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('1500.00')
            };

            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(1000.00); // Balance unchanged
        });

        test('TC-OVD-002: Should reject debit slightly over balance', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('1000.01')
            };

            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(1000.00); // Balance unchanged
        });

        test('TC-OVD-003: Should protect zero balance from overdraft', async () => {
            dataProgram.write(0.00);
            
            const mockRl = {
                question: (prompt, callback) => callback('0.01')
            };

            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(0.00); // Balance unchanged
        });

        test('TC-BIZ-002: No overdrafts allowed - business rule validation', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('2000.00')
            };

            await operations.debit(mockRl);
            expect(dataProgram.read()).toBeGreaterThanOrEqual(0); // Never negative
        });
    });

    describe('Data Persistence and Consistency', () => {
        test('TC-PER-002: Failed debit should not affect balance', async () => {
            const initialBalance = dataProgram.read();
            
            const mockRl = {
                question: (prompt, callback) => callback('2000.00')
            };

            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(initialBalance);
        });

        test('TC-PER-003: Multiple operations should maintain accuracy', async () => {
            // Credit $250
            let mockRl = { question: (p, cb) => cb('250.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1250.00);

            // Debit $100
            mockRl = { question: (p, cb) => cb('100.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(1150.00);

            // Credit $50
            mockRl = { question: (p, cb) => cb('50.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1200.00);

            // Debit $200
            mockRl = { question: (p, cb) => cb('200.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(1000.00);
        });
    });

    describe('Business Rule Validation', () => {
        test('TC-BIZ-001: Initial balance should be $1000.00', () => {
            expect(dataProgram.read()).toBe(1000.00);
        });

        test('TC-BIZ-003: Minimum balance can be $0.00', async () => {
            const mockRl = {
                question: (prompt, callback) => callback('1000.00')
            };

            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(0.00);
        });

        test('TC-BIZ-005: All amounts should use 2 decimal places', () => {
            const balances = [1000.00, 123.45, 0.01, 999999.99];
            balances.forEach(balance => {
                const formatted = operations.formatBalance(balance);
                expect(formatted.split('.')[1]).toHaveLength(2);
            });
        });

        test('TC-BIZ-007: Debits require sufficient funds', async () => {
            dataProgram.write(500.00);

            // Should succeed
            let mockRl = { question: (p, cb) => cb('500.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(0.00);

            // Should fail
            mockRl = { question: (p, cb) => cb('0.01') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(0.00); // Unchanged
        });
    });

    describe('Balance Inquiry Operations', () => {
        test('TC-BAL-001: Should view initial balance', () => {
            const balance = dataProgram.read();
            const formatted = operations.formatBalance(balance);
            expect(formatted).toBe('001000.00');
        });

        test('TC-BAL-002: Should view balance after credit transaction', async () => {
            const mockRl = { question: (p, cb) => cb('500.00') };
            await operations.credit(mockRl);
            const balance = dataProgram.read();
            expect(balance).toBe(1500.00);
            expect(operations.formatBalance(balance)).toBe('001500.00');
        });

        test('TC-BAL-003: Should view balance after debit transaction', async () => {
            const mockRl = { question: (p, cb) => cb('250.00') };
            await operations.debit(mockRl);
            const balance = dataProgram.read();
            expect(balance).toBe(750.00);
            expect(operations.formatBalance(balance)).toBe('000750.00');
        });

        test('TC-BAL-004: View balance does not modify account', async () => {
            const initialBalance = dataProgram.read();
            await operations.total();
            await operations.total();
            await operations.total();
            expect(dataProgram.read()).toBe(initialBalance);
        });

        test('TC-BAL-005: Should handle maximum balance display', () => {
            dataProgram.write(999999.99);
            const balance = dataProgram.read();
            const formatted = operations.formatBalance(balance);
            expect(formatted).toBe('999999.99');
        });

        test('TC-BAL-006: Should handle minimum (zero) balance display', () => {
            dataProgram.write(0.00);
            const balance = dataProgram.read();
            const formatted = operations.formatBalance(balance);
            expect(formatted).toBe('000000.00');
        });
    });

    describe('Extended Credit Transaction Tests', () => {
        test('TC-CRD-003: Should handle large credit amounts', async () => {
            const mockRl = { question: (p, cb) => cb('100000.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(101000.00);
        });

        test('TC-CRD-005: Should credit account to maximum balance', async () => {
            dataProgram.write(500000.00);
            const mockRl = { question: (p, cb) => cb('499999.99') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(999999.99);
        });

        test('TC-CRD-007: Should handle zero amount credit', async () => {
            const initialBalance = dataProgram.read();
            const mockRl = { question: (p, cb) => cb('0.00') };
            await operations.credit(mockRl);
            // Zero credits are rejected as invalid
            expect(dataProgram.read()).toBe(initialBalance);
        });

        test('TC-CRD-008: Multiple consecutive credits', async () => {
            let mockRl = { question: (p, cb) => cb('100.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1100.00);

            mockRl = { question: (p, cb) => cb('200.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1300.00);

            mockRl = { question: (p, cb) => cb('300.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1600.00);
        });

        test('TC-CRD-009: Credit after viewing balance', async () => {
            const initialBalance = dataProgram.read();
            expect(initialBalance).toBe(1000.00);

            const mockRl = { question: (p, cb) => cb('500.00') };
            await operations.credit(mockRl);

            const newBalance = dataProgram.read();
            expect(newBalance).toBe(1500.00);
        });
    });

    describe('Extended Debit Transaction Tests', () => {
        test('TC-DEB-002: Should handle small debit amounts', async () => {
            const mockRl = { question: (p, cb) => cb('0.01') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(999.99);
        });

        test('TC-DEB-003: Should handle decimal precision in debits', async () => {
            const mockRl = { question: (p, cb) => cb('123.45') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(876.55);
        });

        test('TC-DEB-006: Multiple consecutive debits', async () => {
            let mockRl = { question: (p, cb) => cb('100.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(900.00);

            mockRl = { question: (p, cb) => cb('200.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(700.00);

            mockRl = { question: (p, cb) => cb('300.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(400.00);
        });

        test('TC-DEB-007: Debit after credit transaction', async () => {
            let mockRl = { question: (p, cb) => cb('500.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1500.00);

            mockRl = { question: (p, cb) => cb('300.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(1200.00);
        });
    });

    describe('Extended Overdraft Protection Tests', () => {
        test('TC-OVD-004: Balance unchanged after failed debit', async () => {
            const initialBalance = dataProgram.read();
            
            const mockRl = { question: (p, cb) => cb('2000.00') };
            await operations.debit(mockRl);
            
            expect(dataProgram.read()).toBe(initialBalance);
            expect(dataProgram.read()).toBe(1000.00);
        });

        test('TC-OVD-005: Multiple insufficient funds attempts', async () => {
            dataProgram.write(500.00);
            const initialBalance = dataProgram.read();

            let mockRl = { question: (p, cb) => cb('600.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(500.00);

            mockRl = { question: (p, cb) => cb('700.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(500.00);

            expect(dataProgram.read()).toBe(initialBalance);
        });

        test('TC-OVD-006: Successful debit after failed attempt', async () => {
            let mockRl = { question: (p, cb) => cb('1500.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(1000.00); // Failed, unchanged

            mockRl = { question: (p, cb) => cb('500.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(500.00); // Succeeded
        });

        test('TC-OVD-007: Large overdraft attempt', async () => {
            const mockRl = { question: (p, cb) => cb('999999.99') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(1000.00); // Balance unchanged
        });
    });

    describe('Input Validation Tests', () => {
        test('TC-VAL-006: Negative amount for credit should be rejected', async () => {
            const initialBalance = dataProgram.read();
            const mockRl = { question: (p, cb) => cb('-100.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(initialBalance);
        });

        test('TC-VAL-007: Negative amount for debit should be rejected', async () => {
            const initialBalance = dataProgram.read();
            const mockRl = { question: (p, cb) => cb('-100.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(initialBalance);
        });

        test('TC-VAL-008: Non-numeric amount for credit should be rejected', async () => {
            const initialBalance = dataProgram.read();
            const mockRl = { question: (p, cb) => cb('ABC') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(initialBalance);
        });

        test('TC-VAL-009: Non-numeric amount for debit should be rejected', async () => {
            const initialBalance = dataProgram.read();
            const mockRl = { question: (p, cb) => cb('XYZ') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(initialBalance);
        });

        test('TC-VAL-010: Amount with excessive decimals should be handled', async () => {
            const mockRl = { question: (p, cb) => cb('100.999') };
            await operations.credit(mockRl);
            // JavaScript will parse this as 100.999, which we round to 2 decimals
            const balance = dataProgram.read();
            expect(balance).toBeCloseTo(1100.999, 2);
        });

        test('Should reject empty input', async () => {
            const initialBalance = dataProgram.read();
            const mockRl = { question: (p, cb) => cb('') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(initialBalance);
        });

        test('Should reject whitespace-only input', async () => {
            const initialBalance = dataProgram.read();
            const mockRl = { question: (p, cb) => cb('   ') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(initialBalance);
        });
    });

    describe('Extended Data Persistence Tests', () => {
        test('TC-PER-001: Balance persists across operations', async () => {
            // Credit $500.00
            let mockRl = { question: (p, cb) => cb('500.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1500.00);

            // View balance (read-only)
            const balance1 = dataProgram.read();
            expect(balance1).toBe(1500.00);

            // Debit $200.00
            mockRl = { question: (p, cb) => cb('200.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(1300.00);

            // View balance again
            const balance2 = dataProgram.read();
            expect(balance2).toBe(1300.00);
        });

        test('TC-PER-004: Read operations do not modify data', async () => {
            const initialBalance = dataProgram.read();
            
            // Perform 10 read operations
            for (let i = 0; i < 10; i++) {
                await operations.total();
            }
            
            expect(dataProgram.read()).toBe(initialBalance);
            expect(dataProgram.read()).toBe(1000.00);
        });

        test('TC-PER-005: Real-time consistency between read and write', async () => {
            const balance1 = dataProgram.read();
            expect(balance1).toBe(1000.00);

            const mockRl = { question: (p, cb) => cb('100.00') };
            await operations.credit(mockRl);

            // Immediate read should reflect the write
            const balance2 = dataProgram.read();
            expect(balance2).toBe(1100.00);
        });
    });

    describe('End-to-End Scenario Tests', () => {
        test('TC-E2E-001: Complete student account lifecycle', async () => {
            // Start: balance $1000.00
            expect(dataProgram.read()).toBe(1000.00);

            // Credit tuition deposit $5000.00
            let mockRl = { question: (p, cb) => cb('5000.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(6000.00);

            // Debit books payment $350.00
            mockRl = { question: (p, cb) => cb('350.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(5650.00);

            // Debit housing $2000.00
            mockRl = { question: (p, cb) => cb('2000.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(3650.00);

            // View final balance
            const finalBalance = dataProgram.read();
            expect(operations.formatBalance(finalBalance)).toBe('003650.00');
        });

        test('TC-E2E-002: Student with insufficient funds scenario', async () => {
            // View balance
            expect(dataProgram.read()).toBe(1000.00);

            // Attempt debit $1500.00 (should fail)
            let mockRl = { question: (p, cb) => cb('1500.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(1000.00);

            // Credit $1000.00
            mockRl = { question: (p, cb) => cb('1000.00') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(2000.00);

            // Debit $1500.00 (should succeed now)
            mockRl = { question: (p, cb) => cb('1500.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(500.00);

            // View final balance
            const finalBalance = dataProgram.read();
            expect(operations.formatBalance(finalBalance)).toBe('000500.00');
        });

        test('TC-E2E-004: Account depleted to zero', async () => {
            dataProgram.write(750.00);

            // Debit $250.00
            let mockRl = { question: (p, cb) => cb('250.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(500.00);

            // Debit $500.00
            mockRl = { question: (p, cb) => cb('500.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(0.00);

            // View balance
            const balance = dataProgram.read();
            expect(operations.formatBalance(balance)).toBe('000000.00');

            // Attempt debit $0.01 (should fail)
            mockRl = { question: (p, cb) => cb('0.01') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(0.00); // Still zero
        });

        test('TC-E2E-005: Multiple transactions in session', async () => {
            const transactions = [
                { type: 'credit', amount: '100.00' },
                { type: 'debit', amount: '50.00' },
                { type: 'credit', amount: '200.00' },
                { type: 'debit', amount: '75.00' },
                { type: 'credit', amount: '300.00' },
                { type: 'debit', amount: '125.00' },
            ];

            let expectedBalance = 1000.00;

            for (const tx of transactions) {
                const mockRl = { question: (p, cb) => cb(tx.amount) };
                
                if (tx.type === 'credit') {
                    await operations.credit(mockRl);
                    expectedBalance += parseFloat(tx.amount);
                } else {
                    await operations.debit(mockRl);
                    expectedBalance -= parseFloat(tx.amount);
                }
            }

            expect(dataProgram.read()).toBe(expectedBalance);
            expect(dataProgram.read()).toBe(1350.00);
        });
    });

    describe('Boundary and Edge Case Tests', () => {
        test('Should handle maximum valid balance', () => {
            dataProgram.write(999999.99);
            expect(dataProgram.read()).toBe(999999.99);
            expect(operations.formatBalance(999999.99)).toBe('999999.99');
        });

        test('Should handle minimum valid balance', () => {
            dataProgram.write(0.00);
            expect(dataProgram.read()).toBe(0.00);
            expect(operations.formatBalance(0.00)).toBe('000000.00');
        });

        test('Should handle very small amounts', async () => {
            const mockRl = { question: (p, cb) => cb('0.01') };
            await operations.credit(mockRl);
            expect(dataProgram.read()).toBe(1000.01);
        });

        test('Should prevent balance from going negative', async () => {
            dataProgram.write(10.00);
            const mockRl = { question: (p, cb) => cb('10.01') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBeGreaterThanOrEqual(0);
        });

        test('Should handle exact zero after transaction', async () => {
            dataProgram.write(50.00);
            const mockRl = { question: (p, cb) => cb('50.00') };
            await operations.debit(mockRl);
            expect(dataProgram.read()).toBe(0.00);
        });
    });
});
