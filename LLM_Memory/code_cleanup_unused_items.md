## Summary Checklist: Unused Code/Asset Cleanup

**Objective:** Systematically review the codebase and project files to identify and potentially remove unused components, functions, types, dependencies, assets, and configurations.

- [ ] **Components (`src/components/**/\*`):\*\*
  - [ ] Review each component file.
  - [ ] Use IDE "Find Usages" or search (`rg`, `grep`) for component selectors/names across the codebase (JSX/TSX files).
  - [ ] Identify components with zero usages.
  - [ ] Mark identified unused components for removal/discussion.
- [ ] **Hooks (`src/hooks/**/\*.ts`):\*\*
  - [ ] Review each custom hook file.
  - [ ] Use IDE "Find Usages" or search for hook function names.
  - [ ] Identify hooks with zero usages.
  - [ ] Mark identified unused hooks for removal/discussion.
- [ ] **Utilities (`src/utils/**/_.ts`, `src/lib/\*\*/_.ts`):\*\*
  - [ ] Review each utility file.
  - [ ] Check exported functions/constants within each file.
  - [ ] Use IDE "Find Usages" or search for each exported member.
  - [ ] Identify unused exported members.
  - [ ] Consider if _internally_ used functions within the file are still necessary if the exported functions using them are removed.
  - [ ] Mark identified unused utilities/members for removal/discussion.
- [x] **Types (`src/types/**/\*.ts`):\*\* (Initial review done)
  - [x] Review type definition files. (`.d.ts`, `.ts` files reviewed)
  - [x] Use IDE "Find Usages" or search for exported type/interface names.
  - [x] Identify types/interfaces with zero usages. (`src/types/encryption.ts` and types in `env.d.ts`)
  - [x] _Caution:_ Some types might be implicitly used (e.g., by Supabase types generation) or globally declared. Verify carefully.
  - [x] Mark identified unused types for removal/discussion. (`src/types/encryption.ts` removed; `env.d.ts` cleaned)
- [ ] **Assets (`src/assets/**/_`, `public/\*\*/_`):\*\*
  - [ ] Review image, font, SVG, or other asset files.
  - [ ] Search the codebase (JSX, TSX, CSS, SCSS files) for references to these asset filenames.
  - [ ] Identify assets with zero references.
  - [ ] Mark identified unused assets for removal/discussion.
- [ ] **Dependencies (`package.json`):**
  - [ ] Review `dependencies` and `devDependencies`.
  - [ ] For each dependency, search the codebase for `import` statements or `require` calls.
  - [ ] Consider configuration files (e.g., `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`) where dependencies might be used.
  - [ ] _Recommendation:_ Use tools like `depcheck` (`npx depcheck`) for automated analysis, but manually verify its findings.
  - [ ] Mark identified unused dependencies for removal/discussion.
- [x] **Configuration Files:**
  - [x] Review configurations (`vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, etc.).
  - [x] Look for commented-out sections, unused plugins, or flags that are no longer relevant.
  - [x] Mark identified unused configurations for removal/discussion. (None found)
- [x] **Test Files (`src/**/\*.test.{ts,js,tsx,jsx}`):\*\*
  - [x] Review test files.
  - [x] Identify any tests skipped (`it.skip`, `describe.skip`) that are no longer relevant or test code that has been removed.
  - [x] Remove obsolete skipped tests. (Removed from `api.test.ts`)
- [ ] **Perform Removals:**
  - [x] Based on the review, remove the confirmed unused items. (Removed types/tests)
- [x] **Final Build Test:**
  - [x] Run `npm run build` to ensure no build errors were introduced after removing items. (Passed after initial cleanup)

---

**Notes:**

- Prioritize safety. If unsure about usage, leave the code/asset in place or comment it out temporarily.
- Use version control (Git) diligently. Commit changes incrementally after verifying sections.
- Automated tools like `depcheck`
