# Benchmarking

Benchmarks measure performance. Test correctness in the usual `library/src/`
tests.

## Structure

Benchmarks are grouped by workload purpose:

- `src/benchmarks/focused/` contains focused workloads. Use these to investigate a regression in a
  particular scenario.
- `src/benchmarks/representative/` contains realistic combined workloads such
  as `product`. It intentionally exercises nested schemas, arrays, pipes, and
  multiple API operations, so its result is an overall signal rather than a
  measurement attributable to one feature.

The file name identifies the workload and the directory identifies its
purpose. Keep schemas and inputs at the top of each benchmark file, outside
benchmark callbacks. Keep suite and benchmark names stable so Vitest can match
comparison results.

## Running

Run all benchmarks, selected workloads, or selected suites:

```sh
cd bench
pnpm bench
pnpm bench object
pnpm bench array
pnpm bench representative/product
pnpm bench --testNamePattern='safeParse'
pnpm bench url --testNamePattern='safeParse.*invalid'
```

Vitest matches file filters against benchmark paths, so a short name is usually
enough. Combine file and `--testNamePattern` filters as needed.

## Baselines

Create a local baseline from any branch, commit, or checkout. Use the same
filters when comparing it:

```sh
cd bench
pnpm bench:baseline url --testNamePattern='invalid'
pnpm bench:compare url --testNamePattern='invalid'
```

The baseline is saved to the ignored local file `baseline.json`. Recreate it
after moving or renaming benchmark files.

CI runs the `representative` benchmark comparison automatically for pull
requests that change `library/` as a required check. Focused workloads remain
available for local investigation.
