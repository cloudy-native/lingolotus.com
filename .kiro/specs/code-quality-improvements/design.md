# Design Document

## Overview

This design covers a comprehensive code quality improvement initiative for the Lingo Lotus project. The changes span tooling cleanup, hook correctness fixes, test infrastructure, local automation, and documentation deliverables. All changes are scoped to the existing Gatsby 5.11 + React 18 + TypeScript + Chakra UI v2 stack with pnpm as the package manager.

## Architecture

The project follows a static site architecture:

```
lingolotus.com/
├── src/                    # Application source (React + TypeScript)
│   ├── components/         # UI components (Chakra UI)
│   ├── hooks/              # Custom React hooks (useScoring, useSpeechSynthesis)
│   ├── pages/              # Gatsby page components
│   ├── templates/          # Gatsby template components
│   ├── theme/              # Chakra UI theme configuration
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Pure utility functions
├── cdk/                    # AWS CDK infrastructure (separate package)
├── data/                   # JSON data sources (flashcards, books)
├── content/                # Markdown content
├── biome.json              # Canonical linter/formatter config
├── tsconfig.json           # TypeScript configuration
├── gatsby-config.ts        # Gatsby site configuration
└── package.json            # Project manifest
```

No architectural changes are introduced. All modifications target configuration, tooling, a single hook fix, and documentation.

## Components and Interfaces

### 1. Tooling Removal (Requirements 1, 8, 9)

**ESLint Removal:**
- Delete `.eslintrc` and `.eslintignore`
- Remove `eslint`, `@eslint/js`, `eslint-plugin-react`, `globals` from `devDependencies`
- Biome remains the sole lint/format tool

**Console.log Removal:**
- Remove 3 `console.log` statements in `src/templates/deck-study.tsx`
- Add Biome rule `noConsole` or `noConsoleLog` to enforce going forward

**Unused Variables:**
- Run `biome check` and resolve all unused variable warnings
- Biome already has `noUnusedImports: "warn"` — add `noUnusedVariables` rule

### 2. Icon Library Consolidation (Requirement 2)

**Decision: Retain `lucide-react`, remove `react-icons`.**

Rationale: `lucide-react` is used in 10 import sites across the codebase. `react-icons` is used in exactly 1 location (`FaGithub` in `Layout.tsx`). Lucide provides a `Github` icon as a direct replacement.

**Migration:**
```typescript
// Before (Layout.tsx)
import { FaGithub } from "react-icons/fa";

// After
import { Github } from "lucide-react";
```

Remove `react-icons` from `package.json` dependencies.

### 3. ESM Export Fix (Requirement 3)

**Current:** `gatsby-config.ts` uses `module.exports = { ... }`
**Target:** `export default { ... }` with `GatsbyConfig` type annotation

```typescript
import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
    siteMetadata: { /* ... */ },
    plugins: [ /* ... */ ],
};

export default config;
```

Note: Gatsby 5.x supports ESM config files natively.

### 4. Build Artifact Cleanup (Requirements 4, 5, 16)

**CDK artifacts:**
- Remove tracked files: `cdk/lib/cdk-stack.js`, `cdk/lib/cdk-stack.d.ts`, `cdk/test/cdk.test.js`, `cdk/test/cdk.test.d.ts`
- The existing `cdk/.gitignore` already has `*.js` and `*.d.ts` patterns — these files were committed before the gitignore was added. Use `git rm --cached` to untrack them.

**DS_Store files:**
- Remove all tracked `.DS_Store` files via `git rm --cached`
- Update root `.gitignore` to use bare `.DS_Store` (already present, but also add `**/.DS_Store` for explicitness)

### 5. Unit Test Framework (Requirement 6)

**Tool: Vitest**

Configuration approach:
```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
        setupFiles: ["./src/test-setup.ts"],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
```

**package.json script:**
```json
{
    "scripts": {
        "test": "vitest run",
        "test:watch": "vitest"
    }
}
```

**Dependencies to add (devDependencies):**
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `jsdom`
- `@vitejs/plugin-react` (for JSX transform in tests)

### 6. useScoring Hook Fix (Requirement 7)

**Problem:** The hook initializes state from `ids` only on first render (via `useState` initializer). When `ids` changes on subsequent renders, the scores state is stale — new IDs aren't added, removed IDs aren't cleaned up, and function references are recreated each render.

**Solution:**

```typescript
import { useState, useCallback, useEffect, useRef } from "react";

export function useScoring(ids: string[]): UseScoringResult {
    const [scores, setScores] = useState<Record<string, ScoringStatus>>(() =>
        Object.fromEntries(ids.map((id) => [id, "unanswered"]))
    );
    const [currentIndex, setCurrentIndex] = useState(0);

    // Sync scores when ids change: preserve existing, add new as unanswered
    const prevIdsRef = useRef<string[]>(ids);
    useEffect(() => {
        const prevIds = prevIdsRef.current;
        if (prevIds === ids) return;
        prevIdsRef.current = ids;

        setScores((prev) => {
            const next: Record<string, ScoringStatus> = {};
            for (const id of ids) {
                next[id] = prev[id] ?? "unanswered";
            }
            return next;
        });
    }, [ids]);

    const totalCorrect = Object.values(scores).filter(
        (s) => s === "correct"
    ).length;
    const totalIncorrect = Object.values(scores).filter(
        (s) => s === "incorrect"
    ).length;

    const answerCard = useCallback((id: string, isCorrect: boolean) => {
        setScores((prev) => ({
            ...prev,
            [id]: isCorrect ? "correct" : "incorrect",
        }));
    }, []);

    const nextCard = useCallback(() => {
        setCurrentIndex((idx) => Math.min(idx + 1, ids.length - 1));
    }, [ids.length]);

    const reset = useCallback(() => {
        setScores(Object.fromEntries(ids.map((id) => [id, "unanswered"])));
        setCurrentIndex(0);
    }, [ids]);

    return {
        scores,
        currentIndex,
        totalCorrect,
        totalIncorrect,
        answerCard,
        nextCard,
        reset,
    };
}
```

**Key changes:**
1. `useEffect` syncs scores when `ids` array changes — preserves existing scores for retained IDs, initializes new IDs as "unanswered"
2. `useCallback` wraps `answerCard`, `nextCard`, and `reset` for referential stability
3. `useRef` tracks previous IDs to detect changes

### 7. Pre-commit Hooks (Requirement 10)

**Tool: lefthook** (lighter than Husky, single binary, no shell scripts)

```yaml
# lefthook.yml
pre-commit:
  commands:
    lint:
      glob: "*.{ts,tsx,js,jsx,json}"
      run: pnpm biome check --no-errors-on-unmatched {staged_files}

pre-push:
  commands:
    typecheck:
      run: pnpm typecheck
```

**Dependencies:** `lefthook` (devDependency)
**Setup:** `pnpm lefthook install` in `postinstall` script or documented in CONTRIBUTING.md.

### 8. Package Rename (Requirement 11)

```json
{
    "name": "lingolotus",
    "description": "Lingo Lotus — a language learning flashcard and reading app"
}
```

### 9. tsconfig.json Cleanup (Requirement 12)

Remove all commented-out lines. Retain only active options:

```json
{
    "compilerOptions": {
        "target": "esnext",
        "lib": ["dom", "esnext"],
        "jsx": "react",
        "module": "esnext",
        "moduleResolution": "node",
        "baseUrl": "./src",
        "paths": {
            "@/*": ["*"],
            "@": ["."]
        },
        "resolveJsonModule": true,
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true
    },
    "include": [
        "./src/**/*",
        "./gatsby-node.ts",
        "./gatsby-config.ts",
        "./plugins/**/*"
    ]
}
```

### 10. Bundle Analysis (Requirement 13)

**Tool: `gatsby-plugin-webpack-bundle-analyser-v2`**

This integrates with Gatsby's webpack config natively:

```typescript
// gatsby-config.ts — add to plugins array (only in analyze mode)
{
    resolve: "gatsby-plugin-webpack-bundle-analyser-v2",
    options: {
        analyzerMode: "static",
        reportFilename: "../bundle-report.html",
        openAnalyzer: false,
    },
}
```

**package.json script:**
```json
{
    "scripts": {
        "analyze": "ANALYZE=true gatsby build"
    }
}
```

Conditionally include the plugin when `ANALYZE` env var is set.

### 11. Deploy Script Externalization (Requirement 17)

**Current hardcoded value:** `s3://lingolotuswebsitestack-websitebucket75c24d94-yuvr0ssdg44a`

**Approach:** Read from `DEPLOY_BUCKET` environment variable.

```json
{
    "scripts": {
        "deploy": "gatsby clean && gatsby build && ./scripts/deploy.sh"
    }
}
```

```bash
#!/usr/bin/env bash
# scripts/deploy.sh
set -euo pipefail

if [ -z "${DEPLOY_BUCKET:-}" ]; then
    echo "Error: DEPLOY_BUCKET environment variable is not set." >&2
    echo "Usage: DEPLOY_BUCKET=your-bucket-name pnpm deploy" >&2
    exit 1
fi

aws s3 sync public/ "s3://${DEPLOY_BUCKET}" \
    --cache-control "max-age=31536000,public" \
    --delete
```

### 12. Framework Evaluation Document (Requirements 14, 15)

Deliverable: `docs/FRAMEWORK_EVALUATION.md`

Structure:
1. **Comparison Matrix** — Gatsby 5, Astro, Next.js, Vite+React across: build performance, ecosystem health, SSG capability, data layer flexibility, Chakra UI compatibility
2. **Project-specific assessment** — static content site, JSON data, no server API, S3+CloudFront hosting
3. **Chakra UI v2 EOL section** — support status, v3 breaking changes, alternative libraries (Ark UI, Park UI, shadcn/ui)
4. **Recommendation** with rationale
5. **Migration path** (if applicable) — effort estimate, risk, phased approach

### 13. Interfaces

#### useScoring Hook API (unchanged externally)

```typescript
interface UseScoringResult {
    scores: Record<string, ScoringStatus>;
    currentIndex: number;
    totalCorrect: number;
    totalIncorrect: number;
    answerCard: (id: string, isCorrect: boolean) => void;
    nextCard: () => void;
    reset: () => void;
}

function useScoring(ids: string[]): UseScoringResult;
```

#### Deploy Script Interface

```
Environment Variables:
  DEPLOY_BUCKET (required) — S3 bucket name for deployment target

Exit Codes:
  0 — successful deployment
  1 — DEPLOY_BUCKET not set
  Non-zero — aws CLI failure
```

## Data Models

No new data models are introduced. The existing JSON data sources (flashcards, books, languages) and GraphQL layer remain unchanged.

The `CardScore` and `ScoringStatus` types remain as-is:

```typescript
type ScoringStatus = "unanswered" | "correct" | "incorrect";

interface CardScore {
    id: string;
    status: ScoringStatus;
}
```

## Error Handling

### Deploy Script
- Missing `DEPLOY_BUCKET` env var → stderr message + exit code 1
- AWS CLI failure → propagated via `set -euo pipefail`

### useScoring Hook
- Empty `ids` array → valid state (empty scores record, currentIndex 0)
- Duplicate IDs in array → last wins in `Object.fromEntries` (existing behavior, no change)
- `answerCard` called with unknown ID → adds it to scores (defensive, no crash)

### Pre-commit Hooks
- Lint failure → commit blocked, exit code propagated from biome
- Typecheck failure → push blocked, exit code propagated from tsc

## Testing Strategy

### Unit Tests (Vitest)
- **useScoring hook**: Test state preservation on ID changes, initialization behavior, answerCard/nextCard/reset logic
- **Utility functions**: Test `src/utils/flashcard.ts`, `src/utils/language.ts`, `src/utils/paths.ts` for correctness
- **Deploy script**: Test exit behavior for missing env var, correct bucket name interpolation

### Property-Based Tests (Vitest + fast-check)
- **useScoring state preservation**: Generate random ID sets and score states, verify invariants hold across ID changes
- **useScoring referential stability**: Verify function identity across re-renders with stable inputs
- **Deploy script configuration**: Generate valid bucket names, verify correct command construction

### Integration Tests
- **Gatsby build**: Verify the build succeeds after ESM export fix and config changes
- **Pre-commit hooks**: Manual verification that lint failures block commits
- **Bundle analysis**: Verify report generation with `ANALYZE=true gatsby build`

### Smoke Tests
- **Lint clean**: `pnpm lint` exits with code 0
- **Type clean**: `pnpm typecheck` exits with code 0
- **Test runner**: `pnpm test` discovers and executes test files
- **No tracked artifacts**: `git ls-files` shows no .DS_Store or CDK build outputs

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Score state preservation on ID change

*For any* initial set of scored IDs and *for any* new set of IDs that overlaps with the original, when the `ids` parameter changes, existing IDs that remain in the new array SHALL retain their previous score status, and new IDs SHALL be initialized as "unanswered".

**Validates: Requirements 7.1, 7.2**

### Property 2: Stable function references across re-renders

*For any* sequence of re-renders of the useScoring hook where the `ids` parameter remains the same, the `answerCard`, `nextCard`, and `reset` function references SHALL be referentially identical (same object identity) between consecutive renders.

**Validates: Requirements 7.3**

### Property 3: Deploy script uses configured bucket

*For any* valid S3 bucket name string provided via the `DEPLOY_BUCKET` environment variable, the deploy script SHALL construct an `aws s3 sync` command targeting `s3://{DEPLOY_BUCKET}` rather than any hardcoded value.

**Validates: Requirements 17.1**

### Property 4: Deploy script fails on missing configuration

*For any* execution of the deploy script where `DEPLOY_BUCKET` is unset or empty, the script SHALL exit with a non-zero exit code and produce an error message on stderr indicating the required configuration.

**Validates: Requirements 17.2**
