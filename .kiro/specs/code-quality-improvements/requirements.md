# Requirements Document

## Introduction

This specification covers a comprehensive code quality improvement initiative for the Lingo Lotus project (lingolotus.com). The goal is to eliminate technical debt, remove redundant tooling, fix referential instability in hooks, establish unit testing, add local automation via pre-commit hooks, clean up tracked build artifacts and OS files, and evaluate whether the current Gatsby framework remains the best choice versus Astro, Next.js, or Vite+React.

## Glossary

- **Build_System**: The project's build toolchain, currently Gatsby 5.11 with TypeScript
- **Linter**: Biome 2.2.4, the canonical lint and format tool for the project
- **Legacy_Linter**: ESLint and its associated configuration/dependencies, superseded by Biome
- **CDK_Directory**: The `cdk/` folder containing AWS CDK infrastructure-as-code
- **Hook_System**: Git hooks managed via a pre-commit tool (e.g., Husky or lefthook) for local automation
- **Test_Runner**: Vitest, the unit test framework to be introduced for frontend logic
- **useScoring_Hook**: The React hook at `src/hooks/useScoring.ts` managing card scoring state
- **Icon_Library**: A single icon package (lucide-react or react-icons) providing UI icons
- **Deploy_Script**: The `pnpm deploy` npm script that builds and syncs to S3
- **Framework_Evaluation**: A documented comparison of Gatsby, Astro, Next.js, and Vite+React for this project's needs

## Requirements

### Requirement 1: Remove Legacy Linter

**User Story:** As a developer, I want a single authoritative linting tool, so that there is no confusion about which tool governs code style and quality.

#### Acceptance Criteria

1. WHEN the Legacy_Linter removal is complete, THE Build_System SHALL contain no ESLint configuration files (`.eslintrc`, `.eslintignore`) in the repository.
2. WHEN the Legacy_Linter removal is complete, THE Build_System SHALL contain no ESLint-related packages (`eslint`, `@eslint/js`, `eslint-plugin-react`, `globals`) in `package.json` dependencies or devDependencies.
3. THE Linter SHALL remain the sole lint and format tool configured in the project.

### Requirement 2: Consolidate Icon Libraries

**User Story:** As a developer, I want a single icon library, so that bundle size is minimized and icon usage is consistent across the codebase.

#### Acceptance Criteria

1. THE Build_System SHALL depend on exactly one Icon_Library in `package.json`.
2. WHEN the consolidation is complete, THE Build_System SHALL contain no import statements referencing the removed icon package across all source files.
3. WHEN an icon from the removed library is referenced in source code, THE Build_System SHALL replace the reference with an equivalent icon from the retained Icon_Library.

### Requirement 3: Fix CommonJS Export in gatsby-config.ts

**User Story:** As a developer, I want all TypeScript files to use ESM syntax, so that the codebase is consistent and compatible with modern tooling.

#### Acceptance Criteria

1. THE Build_System SHALL use ESM `export default` syntax in `gatsby-config.ts` instead of `module.exports`.
2. WHEN `gatsby-config.ts` is modified, THE Build_System SHALL continue to produce a successful Gatsby build.

### Requirement 4: Remove Committed Build Artifacts from CDK Directory

**User Story:** As a developer, I want only source files tracked in the CDK directory, so that generated artifacts do not pollute version control.

#### Acceptance Criteria

1. THE CDK_Directory SHALL not contain committed `.js` or `.d.ts` files that are generated from TypeScript compilation (specifically `lib/cdk-stack.js`, `lib/cdk-stack.d.ts`, `test/cdk.test.js`, `test/cdk.test.d.ts`).
2. THE CDK_Directory SHALL include `.gitignore` rules that prevent `*.js` and `*.d.ts` generated output from being tracked in the future.

### Requirement 5: Remove Tracked .DS_Store Files and Prevent Re-tracking

**User Story:** As a developer, I want macOS metadata files excluded from version control, so that OS artifacts do not appear in diffs or clutter the repository.

#### Acceptance Criteria

1. THE Build_System SHALL not track any `.DS_Store` files in the repository (including root, `data/`, `cdk/`, and `src/` directories).
2. THE Build_System SHALL include a global `.DS_Store` gitignore pattern that applies recursively to all directories.

### Requirement 6: Establish Unit Test Framework

**User Story:** As a developer, I want a unit test framework for hooks and utilities, so that logic-layer code has automated correctness verification.

#### Acceptance Criteria

1. THE Test_Runner SHALL be configured in the project with a working test command in `package.json` scripts.
2. THE Test_Runner SHALL be capable of running tests for files in `src/hooks/` and `src/utils/` directories.
3. WHEN `pnpm test` is executed, THE Test_Runner SHALL execute all unit test files and report results.
4. THE Test_Runner SHALL support TypeScript source files without requiring a separate compilation step.

### Requirement 7: Fix Referential Instability in useScoring Hook

**User Story:** As a developer, I want the useScoring hook to maintain stable references when its input array changes, so that downstream components do not re-render unnecessarily or lose state.

#### Acceptance Criteria

1. WHEN the `ids` parameter of the useScoring_Hook changes between renders, THE useScoring_Hook SHALL preserve existing score state for IDs that remain in the new array.
2. WHEN the `ids` parameter of the useScoring_Hook changes, THE useScoring_Hook SHALL initialize new IDs as "unanswered" without resetting previously scored IDs.
3. THE useScoring_Hook SHALL return stable function references for `answerCard`, `nextCard`, and `reset` across re-renders (wrapped in `useCallback`).

### Requirement 8: Remove Console.log Statements from Production Code

**User Story:** As a developer, I want no debug logging in production source code, so that the browser console remains clean and no internal state is leaked.

#### Acceptance Criteria

1. THE Build_System SHALL contain no `console.log` statements in source files under `src/`.
2. THE Linter SHALL include a rule that warns or errors on `console.log` usage in source files.

### Requirement 9: Eliminate Unused Variables

**User Story:** As a developer, I want no unused variables in the codebase, so that code is clean and intent is clear.

#### Acceptance Criteria

1. THE Linter SHALL report zero unused variable warnings across all source files under `src/`.
2. WHEN an unused variable is prefixed with an underscore, THE Linter SHALL accept the variable as intentionally unused.

### Requirement 10: Add Pre-commit Hooks for Local Automation

**User Story:** As a developer, I want lint and typecheck to run automatically before commits, so that broken code cannot be committed locally.

#### Acceptance Criteria

1. THE Hook_System SHALL execute the Linter check on staged files before each commit.
2. THE Hook_System SHALL execute TypeScript type checking before each push.
3. IF the Linter check fails, THEN THE Hook_System SHALL prevent the commit from completing.
4. IF the type check fails, THEN THE Hook_System SHALL prevent the push from completing.

### Requirement 11: Rename Package to Project-Specific Name

**User Story:** As a developer, I want the package name to reflect the actual project, so that it is identifiable in tooling and logs.

#### Acceptance Criteria

1. THE Build_System SHALL use `lingolotus` (or `lingolotus.com`) as the package name in `package.json`.
2. THE Build_System SHALL update the package description to accurately reflect the Lingo Lotus language learning application.

### Requirement 12: Clean Up tsconfig.json

**User Story:** As a developer, I want a minimal tsconfig without commented-out boilerplate, so that the configuration is readable and maintainable.

#### Acceptance Criteria

1. THE Build_System SHALL contain a `tsconfig.json` with only active (uncommented) compiler options.
2. THE Build_System SHALL retain all currently enabled compiler options with their existing values.
3. THE Build_System SHALL preserve path aliases, include patterns, and strict mode configuration.

### Requirement 13: Add Bundle Analysis Capability

**User Story:** As a developer, I want to analyze the JavaScript bundle, so that I can identify and address bundle size regressions.

#### Acceptance Criteria

1. THE Build_System SHALL include a bundle analysis tool configured for the project.
2. WHEN a bundle analysis command is executed, THE Build_System SHALL generate a visual report of bundle composition and size.

### Requirement 14: Framework Evaluation and Migration Recommendation

**User Story:** As a developer, I want a documented framework comparison, so that I can make an informed decision about whether to migrate from Gatsby.

#### Acceptance Criteria

1. THE Framework_Evaluation SHALL compare Gatsby 5, Astro, Next.js, and Vite+React across build performance, ecosystem health, static site generation capability, and data layer flexibility.
2. THE Framework_Evaluation SHALL include a recommendation with rationale specific to this project's characteristics (static content site, JSON data sources, no server-side API, S3+CloudFront hosting).
3. THE Framework_Evaluation SHALL outline a migration path if migration is recommended, including effort estimate and risk assessment.
4. THE Framework_Evaluation SHALL be documented in a markdown file in the repository.

### Requirement 15: Address Chakra UI v2 EOL Risk

**User Story:** As a developer, I want a documented plan for the Chakra UI dependency, so that the project is not stranded on an unsupported major version.

#### Acceptance Criteria

1. THE Framework_Evaluation SHALL include an assessment of Chakra UI v2 support status and the feasibility of upgrading to Chakra UI v3 or migrating to an alternative component library.
2. THE Framework_Evaluation SHALL document breaking changes and migration effort for the recommended path.

### Requirement 16: Fix Incomplete .gitignore Coverage

**User Story:** As a developer, I want `.gitignore` to comprehensively cover generated and OS-specific files across all subdirectories, so that no extraneous files are accidentally committed.

#### Acceptance Criteria

1. THE Build_System SHALL include gitignore rules for `.DS_Store` that apply recursively (using `**/.DS_Store` or a bare `.DS_Store` entry without path prefix).
2. THE CDK_Directory SHALL include gitignore rules for TypeScript build output (`*.js`, `*.d.ts`, `*.js.map`) in its own `.gitignore`.

### Requirement 17: Externalize Hardcoded S3 Bucket Name in Deploy Script

**User Story:** As a developer, I want the deploy target to be configurable, so that the deploy script is portable and the bucket name is not embedded in source control.

#### Acceptance Criteria

1. THE Deploy_Script SHALL read the S3 bucket name from an environment variable or configuration file rather than a hardcoded string.
2. IF the S3 bucket name environment variable is not set, THEN THE Deploy_Script SHALL exit with a clear error message indicating the required configuration.
