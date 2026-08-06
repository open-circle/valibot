# Fix

Implement a minimal, verified fix only after the user explicitly asks for it. Triage authorization alone is not fix authorization.

Read the full report first. Append the implementation and verification results to `tmp/triage/gh-<number>/report.md`.

## Confirm the Fix Boundary

- Require a reproduced bug or documentation bug and a medium- or high-confidence causal explanation.
- If the verdict is `unclear` or diagnosis confidence is low, stop and request the missing maintainer decision or evidence. Do not leave speculative source edits or a knowingly failing test in the working tree.
- Record the current status again and preserve all pre-existing changes. Do not create or switch branches unless the user asked and the operation will not absorb unrelated work.

## Implement and Test

Keep the patch limited to the causal path. Do not refactor adjacent code unless necessary for correctness.

For library source:

- Keep ESM imports ending in `.ts`.
- Prefer `interface` for object shapes.
- Add JSDoc to exported functions, only on the first overload in an overload set.
- Preserve `// @__NO_SIDE_EFFECTS__` on pure factories.
- Check the full blast radius before changing shared types, storages, or utilities.

Convert the reproduction into the smallest permanent regression test in the owning module:

- Runtime behavior: extend the nearby `.test.ts` and use helpers from `library/src/vitest/` when applicable.
- Type behavior: extend the nearby `.test-d.ts` with `expectTypeOf` assertions.
- Distribution behavior: add a test that exercises the emitted declaration, export, or package boundary rather than only source inference.

Document that the regression test failed before the implementation change and passes afterward. Run the narrow test first, then the owning package's test suite. Run broader tests when a shared path or cross-package contract changed.

## Format and Validate

Run Prettier and ESLint fixes only on changed files so unrelated user work is not rewritten. Then run the owning package's non-mutating lint and type checks. Typical library commands are:

```bash
pnpm -C library vitest run --typecheck <module-or-test-filter>
pnpm -C library exec eslint --fix <changed-ts-files>
pnpm exec prettier --write <changed-files>
pnpm -C library lint
pnpm -C library test
```

Adapt the commands to the owning package's `package.json`. Record every command and result, including checks that were not run and why.

If behavior, signatures, or public types change, identify the affected website API pages or guides and update them when the user's fix scope includes documentation. Source is the single source of truth.

## Finish

Remove only temporary files and instrumentation created during this work. Compare final status with the recorded baseline; the delta must contain only the approved fix and its tests/docs.

Report the changed files, rationale, regression evidence, validation results, documentation impact, and remaining risk. Do not commit, push, publish, comment, label, close the issue, or open a pull request unless the user separately approves those actions.
