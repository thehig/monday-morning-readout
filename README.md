# Monday Morning Readout

A React application for encrypted environment management and feedback review.

## Component Hierarchy

### App Structure

```
App (Root)
├── DecryptionForm (Initial State)
│   └── QueryClientProvider
└── Main App (Post-Decryption)
    └── QueryClientProvider
        └── HashRouter
            └── Routes
                └── Layout
                    ├── Dashboard (index)
                    └── FeedbackDetail (/feedback/:id)
```

### Component Organization

```
components/
├── auth/
│   └── DecryptionForm
├── data-display/
│   └── Dashboard
├── feedback/
│   ├── cards/
│   │   └── FeedbackCard
│   └── details/
│       ├── FeedbackContent
│       ├── FeedbackDetail
│       └── TechnicalDetails
├── indicators/
│   ├── metrics/
│   │   ├── HappinessIndicator
│   │   └── VelocityIndicator
│   └── visualization/
│       └── Thermometer
├── inputs/
│   └── WeekPicker
└── layout/
    ├── Header
    └── Layout
```

## Utility Functions and Support Code

### Encryption Utilities (`src/utils/encryption.js`)

- **encryptData**: Encrypts sensitive data using password-based encryption
  - Uses CryptoJS for AES encryption
  - Implements PBKDF2 key derivation
  - Includes IV and salt handling
- **decryptData**: Decrypts data using password-based decryption
  - Handles error cases and logging
  - Includes validation checks
- **encryptEnvVars**: Pre-build script for environment variable encryption
  - Specifically handles Supabase credentials
- **decryptEnvVars**: Runtime decryption of environment variables
  - Includes error handling and logging

### Supabase Integration (`src/utils/supabase.ts`)

- **initializeSupabase**: Initializes Supabase client with configuration
  - Handles authentication settings
  - Includes error handling
- **getSupabase**: Singleton access to Supabase client
  - Includes initialization check
- **testConnection**: Tests Supabase connectivity
  - Includes error handling and status reporting

### General Utilities (`src/lib/utils.ts`)

- **cn**: Utility for combining class names with Tailwind
- **formatEmailDisplayName**: Formats email addresses for display
- **formatAmount**: Formats an amount string as Euro currency

### Date Utilities (`src/lib/date-utils.ts`)

- **getWeekDates**: Calculates Monday–Sunday start/end dates for week numbers
- **getCurrentWeek**: Determines current week number
- **getPreviousWeek**: Determines the previous week number (the dashboard default)
- **formatDate**: Date formatting with multiple format options
- **formatTime**: Time formatting with/without seconds
- **formatDateTime**: Combined date and time formatting
- **getRelativeTime**: Calculates relative time descriptions
- **getDateTimeProps**: Generates props for date/time display
- **DATE_FORMAT_OPTIONS**: Constant for date format configurations

### Custom Hooks (`src/hooks/use-po-feedback.ts`)

- **usePOFeedbackByWeek**: React Query hook for fetching feedback by week
  - Includes date range calculations
  - Handles data fetching and error states
- **usePOFeedbackById**: React Query hook for fetching a single feedback entry by ID
  - Includes error handling

### Testing Priorities

1. Encryption/Decryption Utilities (High Priority)

   - Security-critical functionality
   - Complex error handling
   - Environment variable handling

2. Date Utilities (Medium Priority)

   - Core business logic for week calculations
   - Format consistency
   - Edge cases in date handling

3. Data Transformation Utilities (Medium Priority)

   - Complex aggregation logic
   - Data formatting functions
   - Error handling

4. Supabase Integration (High Priority)

   - Critical for data access
   - Connection management
   - Error handling

5. Custom Hooks (High Priority)
   - Data fetching logic
   - State management
   - Error handling
