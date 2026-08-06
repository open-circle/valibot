# Reproduce

Establish whether the reported behavior occurs under a controlled, relevant environment. Do not diagnose, verify intent, or fix.

Always update the **Reproduction** section of `tmp/triage/gh-<number>/report.md`, including failures and limitations.

## Preserve the Baseline

Read the Intake section. Record the current commit, branch, package versions, runtime versions, and initial `git status --short`. Call this the **current checkout**, not `main`, unless its commit is verified to match the repository's default branch.

Use dependencies already installed when possible. If installation is required, use the repository lockfile and a frozen install. For an external or published-version reproduction, work only in the triage directory, inspect manifests first, and disable lifecycle scripts by default.

Do not edit `library/playground.ts` for source-level reproduction: it imports `library/dist/index.mjs`, so it tests the last build rather than the current source.

## Extract a Testable Claim

Record:

- Minimal code and steps
- Observed and expected behavior
- Valibot/package, TypeScript, runtime, framework, and OS versions when relevant
- TypeScript flags such as `strict` and `exactOptionalPropertyTypes`
- Whether the failure concerns runtime source, type inference, emitted declarations, package exports, a browser, a codemod, or an external integration

Reconstruct a minimal example from the description when faithful. If a linked sandbox or repository is essential, inspect it before running anything. If the expected behavior or key setup cannot be determined, return `needs-information` and specify the smallest missing facts.

## Choose the Correct Harness

For core `library/` and `packages/to-json-schema/` source behavior, create a uniquely named temporary test only after confirming the path is absent:

- Runtime: `src/issue-<number>.test.ts`
- Types: `src/issue-<number>.test-d.ts`

Follow nearby tests and import current source through `./index.ts` or the package's corresponding relative entry point. Encode the reporter's expected behavior as an assertion, then confirm any failure is the claimed mismatch rather than an import, setup, or unrelated type error.

Run from the owning package:

```bash
pnpm vitest run issue-<number>
pnpm vitest run --typecheck issue-<number>
```

Use the owning package's existing harness for website and codemod reports. For `packages/i18n/`, test the generated module or build script implicated by the report and run its TypeScript lint check. Do not force every package through the core-library test shape.

Source type tests are insufficient for bugs that appear only across package boundaries, in published exports, or in emitted `.d.ts` files. For those reports, build or pack the affected package, install it into a minimal consumer under the triage directory with scripts disabled, and reproduce with the reported TypeScript version and `tsconfig` flags.

For browser-, Deno-, Bun-, or framework-specific behavior, use the named runtime when available. Otherwise return `blocked-by-environment`; do not claim the bug is absent from a Node-only substitute.

## Compare Relevant Versions

Test the current checkout first. If the issue names an older release, reproduce that exact release in an isolated consumer under the triage directory. Do not conclude `already-fixed-on-default-branch` unless the default-branch commit was identified and the same reproduction passed against that commit in an isolated clean copy.

If a result differs by version, identify the fixing or regressing commit when practical, but leave causal analysis to the diagnosis phase.

## Validate the Result

Run at least one nearby control case to prove the harness is sound. Classify the outcome as one of:

- `reproduced` — the precise observed/expected mismatch occurs
- `not-reproduced` — the relevant setup was matched and the claimed mismatch does not occur
- `needs-information` — the claim cannot yet be made testable
- `already-fixed-on-default-branch` — reproduced in the reported version but not at the verified default-branch commit
- `blocked-by-environment` — a required environment cannot be exercised

Copy the final reproduction into the triage directory. Remove only temporary files created for the run. Compare the final worktree status with the recorded baseline and report any difference; do not demand a globally clean worktree.

## Report

Record the exact reproduction code, commands, relevant versions, observed output, expected output, control case, outcome, and confidence in the environment match. Never omit failed attempts that materially limit the conclusion.
