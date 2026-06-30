# Benchmarking

Valibot has a runtime benchmark suite for catching performance regressions and proving
optimizations. It runs on [Vitest's built-in `bench`](https://vitest.dev/api/#bench), so there is
no extra dependency.

## Running

```sh
cd library
pnpm bench
```

This runs every `library/bench/*.bench.ts` file and prints throughput per case (`hz`,
operations per second, higher is better) along with latency percentiles. To run a single file,
pass a filter:

```sh
pnpm bench variant
```

## What is covered

The suite lives in `library/bench/` and targets the runtime hot paths:

- `variant.bench.ts` / `variant-async.bench.ts` — discriminated-union dispatch (hit first, middle,
  last option, and miss).
- `enum.bench.ts` / `picklist.bench.ts` — membership against a large option list (hit and miss).
- `object.bench.ts` — object validation (all keys present, and a missing required key).
- `array.bench.ts`, `string-pipe.bench.ts` — regression guards for the array and pipe paths; they
  should stay flat and signal a regression if they don't.

## Results

Measured before/after numbers and the speedups they prove are kept in
[`library/bench/RESULTS.md`](./library/bench/RESULTS.md). Update that file when an optimization
changes the numbers, recording both the baseline and the optimized run on the same machine.

## Adding a benchmark

Create `library/bench/<name>.bench.ts`:

```ts
import { bench, describe } from 'vitest';
import * as v from '../src/index.ts';

// Build the schema and inputs once, outside bench().
const schema = v.object({ id: v.number(), name: v.string() });
const input = { id: 1, name: 'test' };

describe('object', () => {
  bench('valid', () => {
    return v.safeParse(schema, input);
  });
});
```

Guidelines:

- Build schemas and inputs once outside `bench()` so you measure validation, not setup.
- Use `safeParse` / `safeParseAsync` rather than `parse` to avoid throw overhead skewing results.
- Return the parse result from `bench()` so the engine cannot drop the call as dead code.
- Absolute `hz` values depend on hardware, so compare the baseline and optimized numbers on the same
  machine, not across machines.
