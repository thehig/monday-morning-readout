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
│   └── details/
│       └── FeedbackDetail
├── indicators/
├── inputs/
├── layout/
│   └── Layout
├── navigation/
└── ui/
```
