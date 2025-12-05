/**
 * Student Account Management System
 * Node.js conversion from COBOL legacy application
 * 
 * Preserves original business logic:
 * - Initial balance: $1,000.00
 * - Overdraft protection (no negative balances)
 * - Decimal precision (2 places)
 * - Atomic read-modify-write operations
 */

const readline = require('readline');

// DataProgram equivalent - Data Persistence Layer
class DataProgram {
    constructor() {
        this.storageBalance = 1000.00; // Initial balance
    }

    /**
     * READ operation - Returns current balance
     * @returns {number} Current balance
     */
    read() {
        return this.storageBalance;
    }

    /**
     * WRITE operation - Updates stored balance
     * @param {number} balance - New balance to store
     */
    write(balance) {
        this.storageBalance = balance;
    }
}

// Operations equivalent - Business Logic Layer
class Operations {
    constructor(dataProgram) {
        this.dataProgram = dataProgram;
    }

    /**
     * TOTAL operation - View current balance
     */
    async total() {
        const balance = this.dataProgram.read();
        console.log(`Current balance: ${this.formatBalance(balance)}`);
    }

    /**
     * CREDIT operation - Add funds to account
     * @param {readline.Interface} rl - Readline interface for user input
     */
    async credit(rl) {
        const amount = await this.getAmount(rl, 'Enter credit amount: ');
        
        if (amount === null) return;

        const currentBalance = this.dataProgram.read();
        const newBalance = Math.round((currentBalance + amount) * 100) / 100;
        
        this.dataProgram.write(newBalance);
        console.log(`Amount credited. New balance: ${this.formatBalance(newBalance)}`);
    }

    /**
     * DEBIT operation - Withdraw funds from account
     * Enforces overdraft protection
     * @param {readline.Interface} rl - Readline interface for user input
     */
    async debit(rl) {
        const amount = await this.getAmount(rl, 'Enter debit amount: ');
        
        if (amount === null) return;

        const currentBalance = this.dataProgram.read();
        
        // Overdraft protection - Critical business rule
        if (currentBalance >= amount) {
            const newBalance = Math.round((currentBalance - amount) * 100) / 100;
            this.dataProgram.write(newBalance);
            console.log(`Amount debited. New balance: ${this.formatBalance(newBalance)}`);
        } else {
            console.log('Insufficient funds for this debit.');
        }
    }

    /**
     * Helper method to get amount input from user
     * @param {readline.Interface} rl - Readline interface
     * @param {string} prompt - Prompt message
     * @returns {Promise<number|null>} Amount or null if invalid
     */
    getAmount(rl, prompt) {
        return new Promise((resolve) => {
            rl.question(prompt, (input) => {
                const amount = parseFloat(input);
                
                if (isNaN(amount) || amount < 0) {
                    console.log('Invalid amount. Please enter a valid positive number.');
                    resolve(null);
                } else {
                    // Round to 2 decimal places for currency precision
                    resolve(Math.round(amount * 100) / 100);
                }
            });
        });
    }

    /**
     * Format balance with 2 decimal places
     * @param {number} balance - Balance to format
     * @returns {string} Formatted balance
     */
    formatBalance(balance) {
        return balance.toFixed(2).padStart(9, '0');
    }
}

// MainProgram equivalent - User Interface and Main Loop
class MainProgram {
    constructor() {
        this.dataProgram = new DataProgram();
        this.operations = new Operations(this.dataProgram);
        this.continueFlag = true;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Display main menu
     */
    displayMenu() {
        console.log('--------------------------------');
        console.log('Account Management System');
        console.log('1. View Balance');
        console.log('2. Credit Account');
        console.log('3. Debit Account');
        console.log('4. Exit');
        console.log('--------------------------------');
    }

    /**
     * Get user menu choice
     * @returns {Promise<string>} User's menu choice
     */
    getUserChoice() {
        return new Promise((resolve) => {
            this.rl.question('Enter your choice (1-4): ', (answer) => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * Process user's menu selection
     * @param {string} choice - User's menu choice
     */
    async processChoice(choice) {
        switch (choice) {
            case '1':
                await this.operations.total();
                break;
            case '2':
                await this.operations.credit(this.rl);
                break;
            case '3':
                await this.operations.debit(this.rl);
                break;
            case '4':
                this.continueFlag = false;
                break;
            default:
                console.log('Invalid choice, please select 1-4.');
        }
    }

    /**
     * Main application loop
     */
    async run() {
        while (this.continueFlag) {
            this.displayMenu();
            const choice = await this.getUserChoice();
            await this.processChoice(choice);
        }
        
        console.log('Exiting the program. Goodbye!');
        this.rl.close();
    }
}

// Application entry point
if (require.main === module) {
    const app = new MainProgram();
    app.run().catch((error) => {
        console.error('Application error:', error);
        process.exit(1);
    });
}

module.exports = { MainProgram, Operations, DataProgram };
