# Verify

Determine whether the reproduced behavior violates Valibot's intended contract. Do not fix it.

Always append to the **Verification** section of `tmp/triage/gh-<number>/report.md`.

## Separate Facts from Expectations

Restate independently:

- What the reproduction proves happens
- What the reporter expects instead
- Which documented contract, invariant, standard, compatibility promise, or maintainer decision could support that expectation

Implementation behavior establishes what the code currently does; it does not by itself prove that behavior is intended. Likewise, the absence of a comment does not prove a bug.

## Gather Intent Evidence

Check the most relevant sources:

1. Explicit maintainer decisions in prior issues, pull requests, RFCs, release notes, or comments
2. JSDoc, public API documentation, guides, and compatibility promises
3. Runtime and type tests, including nearby edge cases
4. Git history and blame for the causal lines
5. The implementation's architecture and invariants
6. Authoritative external specifications when the API implements a standard

Treat tests as strong evidence of the current contract, but not automatic proof that every asserted edge case was deliberately chosen. Resolve documentation/code mismatches rather than assuming either side must be correct. Prefer primary sources for external standards and record the exact version or date consulted.

Ask whether the behavior was knowingly chosen, is required by a contract, or is an accidental consequence. When evidence conflicts, present the conflict to the maintainer.

## Verdict

Choose one:

- `bug` — evidence shows an implementation defect or regression against the intended contract
- `intended-behavior` — direct evidence supports the current behavior; explain the rationale and supported alternative
- `documentation-bug` — implementation intent is clear but public documentation is wrong or incomplete
- `external` — the root cause lies in another library, tool, runtime, or specification implementation
- `unclear` — evidence is insufficient or conflicting and requires a maintainer decision

Do not label a report `bug` merely because the behavior is surprising or lacks rationale. Do not label it `intended-behavior` merely because the code or an existing test currently behaves that way.

Assign confidence:

- `high` — direct contract or maintainer evidence agrees with the reproduction and diagnosis
- `medium` — several sources support the verdict but a meaningful ambiguity remains
- `low` — the verdict relies mainly on inference

Record citations to files at the tested commit and links or numbers for relevant issues, pull requests, documentation, and specifications. State the recommended next step and any maintainer decision still needed.
