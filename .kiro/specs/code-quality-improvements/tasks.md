# Implementation Plan: Code Quality Improvements

## Overview

A comprehensive cleanup initiative for the Lingo Lotus project. The first task is a framework evaluation document — a decision gate that determines whether subsequent Gatsby-specific tasks are relevant or should be replaced with an Astro migration path. All remaining tasks cover tooling removal, icon consolidation, config fixes, test infrastructure, hook correctness, pre-commit automation, and deploy script improvements.

## Tasks

- [x] 1. Framework evaluation document (decision gate)
  - [x] 1.1 Create framework evaluation markdown document
    - Create `docs/FRAMEWORK_EVALUATION.md`
    - **Comparison matrix** covering Gatsby 5, Astro, Next.js, and Vite+React across: build performance, ecosystem health, SSG capability, data layer flexibility, Chakra UI compatibility
    - **Key research findings to include:**
      - Gatsby is in maintenance mode (last release v5.16, Gatsby Cloud shut down, community largely migrated, Node version breakage common)
      - Astro (now Cloudflare-owned, v6+ available): Content Collections with `file()` loader handles JSON natively with Zod schema validation and TypeScript types; zero JS by default (ships pure HTML); islands architecture for opt-in React hydration; 15-second builds vs Gatsby's multi-minute builds; `@astrojs/react` integration means existing React components work; no GraphQL needed — `getCollection()` and `getEntry()` provide simpler typed APIs
      - Next.js: overkill for a purely static content site — focused on dynamic server rendering and API routes
      - Vite+React (SPA): loses static HTML/SEO benefits, not ideal for content-heavy site
    - **Project-specific assessment:** The user's JSON data (flashcards, books, stories) maps directly to Astro content collections with `file()` and `glob()` loaders. Static HTML output provides better SEO and loading than Gatsby's JS-heavy hydration. React components still work for interactive parts (flashcard study, speech synthesis) via islands.
    - **Chakra UI v2 EOL section:** v2 support status, v3 drops Emotion for Panda CSS (multi-phase architectural refactor), alternative libraries (Ark UI, Park UI, shadcn/ui). Note: if migrating to Astro, Chakra components would only be used inside React islands.
    - **Recommendation:** Recommend Astro with clear rationale — GraphQL not needed (Astro's `getCollection()` is simpler and typed), static HTML gives better SEO/loading, React components still work for interactive parts, 15s builds vs multi-minute Gatsby builds
    - **Migration path:** Phased approach with effort estimate and risk assessment
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 15.1, 15.2_

- [ ] 2. Checkpoint - Framework decision
  - Review the framework evaluation with the user. The decision here determines whether Gatsby-specific tasks (ESM export fix, bundle analysis plugin) apply or should be replaced with Astro migration tasks. Ask the user if questions arise.

- [ ] 3. Remove legacy linter and clean up lint configuration
  - [ ] 3.1 Remove ESLint config files and dependencies
    - Delete `.eslintrc` and `.eslintignore` from the repository root
    - Remove `eslint`, `@eslint/js`, `eslint-plugin-react`, and `globals` from `devDependencies` in `package.json`
    - Run `pnpm install` to update lockfile
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 3.2 Add Biome rules for console.log and unused variables
    - Add `"noConsole": "warn"` (or `"noConsoleLog": "warn"`) to `biome.json` linter rules
    - Add `"noUnusedVariables": "warn"` to `biome.json` linter rules under `correctness`
    - _Requirements: 8.2, 9.1, 9.2_

  - [ ] 3.3 Remove console.log statements from source code
    - Remove 3 `console.log` statements in `src/templates/deck-study.tsx`
    - _Requirements: 8.1_

  - [ ] 3.4 Eliminate unused variables across the codebase
    - Run `pnpm biome check src` and resolve all unused variable warnings
    - Prefix intentionally unused variables with underscore where appropriate
    - _Requirements: 9.1, 9.2_

- [ ] 4. Consolidate icon libraries
  - [ ] 4.1 Replace react-icons usage with lucide-react equivalent
    - In `src/components/Layout.tsx`, replace `import { FaGithub } from "react-icons/fa"` with `import { Github } from "lucide-react"` (merge into existing lucide import)
    - Update the JSX usage of `FaGithub` to `Github`
    - _Requirements: 2.2, 2.3_

  - [ ] 4.2 Remove react-icons dependency
    - Remove `react-icons` from `dependencies` in `package.json`
    - Run `pnpm install` to update lockfile
    - Verify no remaining imports reference `react-icons`
    - _Requirements: 2.1_

- [ ] 5. Fix configuration files
  - [ ] 5.1 Convert gatsby-config.ts from CommonJS to ESM export
    - Replace `module.exports = {` with `export default { ... }` using a typed `GatsbyConfig` variable
    - Add `import type { GatsbyConfig } from "gatsby"` at the top
    - Note: skip this task if framework decision is to migrate away from Gatsby
    - _Requirements: 3.1, 3.2_

  - [ ] 5.2 Clean up tsconfig.json
    - Remove all commented-out lines from `tsconfig.json`
    - Retain only active options: `target`, `lib`, `jsx`, `module`, `moduleResolution`, `baseUrl`, `paths`, `resolveJsonModule`, `allowSyntheticDefaultImports`, `esModuleInterop`, `forceConsistentCasingInFileNames`, `strict`, `skipLibCheck`
    - Retain `include` array unchanged
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ] 5.3 Rename package to lingolotus
    - Change `"name"` in `package.json` from `"gatsby-typescript-chakraui"` to `"lingolotus"`
    - Update `"description"` to `"Lingo Lotus — a language learning flashcard and reading app"`
    - _Requirements: 11.1, 11.2_

- [ ] 6. Clean up tracked artifacts and fix gitignore
  - [ ] 6.1 Remove tracked .DS_Store files and update gitignore
    - Run `git rm --cached .DS_Store cdk/.DS_Store data/.DS_Store` (and any others found)
    - Ensure root `.gitignore` has a bare `.DS_Store` entry and add `**/.DS_Store` for explicitness
    - _Requirements: 5.1, 5.2, 16.1_

  - [ ] 6.2 Remove committed CDK build artifacts and update cdk/.gitignore
    - Run `git rm --cached cdk/lib/cdk-stack.js cdk/lib/cdk-stack.d.ts cdk/test/cdk.test.js cdk/test/cdk.test.d.ts`
    - Verify `cdk/.gitignore` contains rules for `*.js`, `*.d.ts`, and `*.js.map`
    - _Requirements: 4.1, 4.2, 16.2_

- [ ] 7. Checkpoint - Verify lint and build
  - Ensure `pnpm lint` passes with zero errors, `pnpm typecheck` passes, and `pnpm build` succeeds. Ask the user if questions arise.

- [ ] 8. Establish Vitest unit test framework
  - [ ] 8.1 Install Vitest and testing dependencies
    - Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, and `@vitejs/plugin-react` as devDependencies
    - Run `pnpm install`
    - _Requirements: 6.1, 6.4_

  - [ ] 8.2 Create Vitest configuration
    - Create `vitest.config.ts` at project root with jsdom environment, globals enabled, path alias for `@/`, and include pattern `src/**/*.{test,spec}.{ts,tsx}`
    - Create `src/test-setup.ts` with `@testing-library/jest-dom` import
    - _Requirements: 6.2_

  - [ ] 8.3 Add test scripts to package.json
    - Add `"test": "vitest run"` and `"test:watch": "vitest"` to scripts
    - _Requirements: 6.1, 6.3_

  - [ ] 8.4 Write a smoke test to verify framework setup
    - Create `src/hooks/__tests__/useScoring.test.ts` with a minimal test that imports and invokes the hook
    - Verify `pnpm test` discovers and runs the test successfully
    - _Requirements: 6.2, 6.3_

- [ ] 9. Fix useScoring hook referential instability
  - [ ] 9.1 Implement score state synchronization on ID changes
    - Add `useEffect` with `useRef` to track previous IDs
    - When `ids` changes, preserve existing scores for retained IDs and initialize new IDs as `"unanswered"`
    - Remove IDs from state that are no longer in the `ids` array
    - _Requirements: 7.1, 7.2_

  - [ ] 9.2 Wrap hook functions in useCallback for referential stability
    - Wrap `answerCard` in `useCallback` with empty dependency array
    - Wrap `nextCard` in `useCallback` with `[ids.length]` dependency
    - Wrap `reset` in `useCallback` with `[ids]` dependency
    - _Requirements: 7.3_

  - [ ]* 9.3 Write property test: score state preservation on ID change
    - **Property 1: Score state preservation on ID change**
    - Use fast-check to generate random ID sets and score states
    - Verify that when IDs change, retained IDs keep their scores and new IDs are "unanswered"
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 9.4 Write property test: stable function references
    - **Property 2: Stable function references across re-renders**
    - Verify `answerCard`, `nextCard`, `reset` maintain same identity when `ids` is stable
    - **Validates: Requirements 7.3**

  - [ ]* 9.5 Write unit tests for useScoring hook
    - Test initialization with given IDs
    - Test answerCard updates score correctly
    - Test nextCard advances index
    - Test reset returns all scores to unanswered
    - Test empty ids array edge case
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 10. Checkpoint - Verify tests pass
  - Ensure all tests pass with `pnpm test`, ask the user if questions arise.

- [ ] 11. Externalize S3 bucket name in deploy script
  - [ ] 11.1 Create deploy shell script
    - Create `scripts/deploy.sh` with bash strict mode (`set -euo pipefail`)
    - Read `DEPLOY_BUCKET` from environment variable
    - Exit with error message to stderr if `DEPLOY_BUCKET` is unset or empty
    - Execute `aws s3 sync public/ "s3://${DEPLOY_BUCKET}" --cache-control "max-age=31536000,public" --delete`
    - Make the script executable (`chmod +x`)
    - _Requirements: 17.1, 17.2_

  - [ ] 11.2 Update package.json deploy script
    - Change the `deploy` script to `gatsby clean && gatsby build && ./scripts/deploy.sh`
    - Note: if migrating to Astro, adjust build command accordingly
    - _Requirements: 17.1_

  - [ ]* 11.3 Write unit tests for deploy script
    - **Property 3: Deploy script uses configured bucket**
    - **Property 4: Deploy script fails on missing configuration**
    - Test that missing DEPLOY_BUCKET exits non-zero with error message
    - Test that valid DEPLOY_BUCKET produces correct s3 sync command
    - **Validates: Requirements 17.1, 17.2**

- [ ] 12. Add pre-commit hooks with lefthook
  - [ ] 12.1 Install and configure lefthook
    - Add `lefthook` as a devDependency
    - Create `lefthook.yml` at project root with `pre-commit` lint command (biome check on staged files) and `pre-push` typecheck command
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 12.2 Add lefthook install to project setup
    - Add `"postinstall": "lefthook install"` to `package.json` scripts (or document in CONTRIBUTING.md)
    - Run `pnpm lefthook install` to activate hooks locally
    - _Requirements: 10.1_

- [ ] 13. Add bundle analysis capability
  - [ ] 13.1 Configure bundle analysis
    - If staying with Gatsby: add `gatsby-plugin-webpack-bundle-analyser-v2` as a devDependency, conditionally include in `gatsby-config.ts` when `ANALYZE` env var is set
    - If migrating to Astro: use `astro-bundle-analyzer` or `rollup-plugin-visualizer` instead
    - Add `"analyze": "ANALYZE=true <build-command>"` script to `package.json`
    - _Requirements: 13.1, 13.2_

- [ ] 14. Final checkpoint - Full verification
  - Ensure `pnpm lint` exits cleanly, `pnpm typecheck` passes, `pnpm test` passes, and `pnpm build` succeeds. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between major phases
- Property tests validate universal correctness properties from the design document
- **Task 1 is a decision gate** — the framework evaluation must be completed and reviewed before proceeding. If the decision is to migrate to Astro, tasks 5.1 (gatsby-config ESM fix) and 13.1 (bundle analysis) should use Astro-appropriate tooling instead.
- Tasks 3, 4, 6, 8, 9, 11, and 12 apply regardless of framework choice (linting, icons, git cleanup, testing, hook fix, deploy script, pre-commit hooks)
- The deploy script task requires the existing S3 bucket name to be set as `DEPLOY_BUCKET` env var going forward
- CDK artifact removal and .DS_Store cleanup require `git rm --cached` (does not delete local files)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["3.1", "3.2", "4.1", "5.2", "5.3", "6.1", "6.2"] },
    { "id": 2, "tasks": ["3.3", "3.4", "4.2", "5.1"] },
    { "id": 3, "tasks": ["8.1", "11.1", "12.1"] },
    { "id": 4, "tasks": ["8.2", "8.3", "11.2", "12.2", "13.1"] },
    { "id": 5, "tasks": ["8.4", "9.1"] },
    { "id": 6, "tasks": ["9.2"] },
    { "id": 7, "tasks": ["9.3", "9.4", "9.5", "11.3"] }
  ]
}
```
