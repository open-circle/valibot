# Diagnose

Find the causal code path for a reproduced issue. Do not verify product intent or implement a fix.

Always append to the **Diagnosis** section of `tmp/triage/gh-<number>/report.md`. If reproduction did not return `reproduced`, record that diagnosis was skipped.

## Route to the Owning Area

Do not assume every issue belongs to the core library. Start from the affected package and its local tests, configuration, and package scripts.

For `library/src/`, use these landmarks:

| Area        | Likely responsibility                                    |
| ----------- | -------------------------------------------------------- |
| `schemas/`  | Input typing and dataset creation                        |
| `actions/`  | Validation and transformation in pipelines               |
| `methods/`  | API orchestration such as `parse`, `pipe`, and `partial` |
| `types/`    | Shared inference and dataset types                       |
| `utils/`    | Shared runtime helpers, prefixed with `_`                |
| `storages/` | Global configuration and message state                   |

Schemas and actions expose a `'~run'` method that receives a dataset and config. Trace runtime issues through that method and shared utilities. Trace type issues from the public generic signature through helper types and, when relevant, generated declarations and package exports.

## Trace the Failure

1. Read the minimal reproduction and its control case.
2. Read the implementation, runtime tests, type tests, JSDoc, and package configuration for the first API involved.
3. Follow values or types until the first point where actual behavior diverges from the expected invariant.
4. Check every caller or shared helper on the path to estimate blast radius.
5. Form at least one plausible alternative explanation and use a targeted experiment or source evidence to rule it in or out.

Prefer logging in the temporary reproduction. If source instrumentation is necessary, edit only known-clean lines, record the diff, and revert only those exact edits. Never blanket-restore tracked files.

For regressions, inspect file history and blame. Use an isolated copy for bisection; do not switch the user's checkout across commits. For type bugs, determine whether the failure originates in source inference, declaration emit, module resolution, TypeScript version behavior, or a downstream wrapper.

## Establish Cause and Confidence

Document:

- The first faulty decision or type transformation, with file/line references and commit SHA
- How it produces the reproduced output
- Alternatives tested and ruled out
- Shared callers and affected APIs
- A minimal fix direction without changing code

Assign confidence conservatively:

- `high` — a targeted experiment and direct code path explain both the failure and control case
- `medium` — the code path is supported by evidence but an environment or intent question remains
- `low` — the cause is mostly inference or multiple plausible causes remain

Low confidence is a valid result. Do not turn uncertainty into a speculative fix.
