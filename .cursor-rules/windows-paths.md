# Windows Path Conventions

When working with file paths in Windows environments:

1. Use backslashes (`\`) instead of forward slashes
2. Include the drive letter with colon (`C:`)
3. Use full Windows path format: `C:\path\to\directory`

## Examples:

✅ Correct: `C:\dev\personal\project`
❌ Incorrect: `/c%3A/dev/personal/project`

## Implementation:

- Always convert URL-encoded paths (`%3A`) to Windows format
- Use backslashes for directory separators
- Include drive letter prefix
- For absolute paths, start with drive letter (e.g., `C:\`)
