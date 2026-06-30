import { bench, describe } from 'vitest';
import * as v from '../src/index.ts';

// Flat async discriminated union with 10 options, each keyed by a literal
// `type`. Discriminator entries are sync (literal); the variant run is async.
const options = Array.from({ length: 10 }, (_, i) =>
  v.object({
    type: v.literal(`option_${i}`),
    value: v.number(),
    label: v.string(),
  })
);
// @ts-expect-error - runtime array is fine for the benchmark
const schema = v.variantAsync('type', options);

const firstInput = { type: 'option_0', value: 1, label: 'a' };
const middleInput = { type: 'option_5', value: 1, label: 'a' };
const lastInput = { type: 'option_9', value: 1, label: 'a' };
const missInput = { type: 'option_x', value: 1, label: 'a' };

describe('variantAsync (10 options)', () => {
  bench('hit first option', async () => {
    await v.safeParseAsync(schema, firstInput);
  });

  bench('hit middle option', async () => {
    await v.safeParseAsync(schema, middleInput);
  });

  bench('hit last option', async () => {
    await v.safeParseAsync(schema, lastInput);
  });

  bench('miss (invalid discriminator)', async () => {
    await v.safeParseAsync(schema, missInput);
  });
});
