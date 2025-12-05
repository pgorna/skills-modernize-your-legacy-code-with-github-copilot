# Student Account Management System - Node.js

## Overview

This is a Node.js implementation of the Student Account Management System, migrated from the legacy COBOL application while preserving all original business logic and functionality.

## Migration from COBOL

This application maintains:

- **Original business logic**: Identical behavior to COBOL version
- **Data integrity**: Same validation and balance management rules
- **Menu options**: Exact same user interface and options
- **Business rules**: All constraints preserved (overdraft protection, decimal precision, etc.)

## Architecture

The application follows the same three-layer architecture as the COBOL version:

```
┌─────────────────┐
│   MainProgram   │  User Interface & Menu
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Operations    │  Business Logic
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DataProgram    │  Data Persistence
└─────────────────┘
```

## Business Rules

1. **Initial Balance**: $1,000.00
2. **Overdraft Protection**: Cannot withdraw more than current balance
3. **Decimal Precision**: All amounts use 2 decimal places
4. **Balance Range**: $0.00 to $999,999.99
5. **Transaction Atomicity**: Balance reads and writes are atomic

## Installation

```bash
cd src/accounting
npm install
```

## Running the Application

### Using npm

```bash
npm start
```

### Using VS Code Debugger

1. Open VS Code
2. Go to Run and Debug (Ctrl+Shift+D)
3. Select "Launch Account Management System"
4. Press F5

## Menu Options

1. **View Balance** - Display current account balance
2. **Credit Account** - Add funds to the account
3. **Debit Account** - Withdraw funds from the account
4. **Exit** - Close the application

## Testing

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Watch mode for development:

```bash
npm run test:watch
```

## Code Structure

- `index.js` - Main application file containing:
  - `DataProgram` class - Data persistence layer
  - `Operations` class - Business logic layer
  - `MainProgram` class - User interface and application loop

## Differences from COBOL Version

While maintaining identical functionality, the Node.js version includes:

- Modern async/await patterns for user input
- Class-based architecture for better encapsulation
- Promise-based readline interface
- Export of classes for testing capabilities
- Better error handling and validation

## Business Logic Validation

This implementation has been validated against the original COBOL application to ensure:

- Identical menu behavior
- Same balance calculations
- Equivalent overdraft protection
- Matching output formats
- Consistent error handling

Refer to `docs/TESTPLAN.md` for the complete test plan used to validate the migration.
