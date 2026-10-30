import { bench, describe } from 'vitest';
import * as v from '../src/index.ts';

// Flat discriminated union with 10 options, each keyed by a literal `type`.
const options = Array.from({ length: 10 }, (_, i) =>
  v.object({
    type: v.literal(`option_${i}`),
    value: v.number(),
    label: v.string(),
  })
);
// @ts-expect-error - runtime array is fine for the benchmark
const schema = v.variant('type', options);

const firstInput = { type: 'option_0', value: 1, label: 'a' };
const middleInput = { type: 'option_5', value: 1, label: 'a' };
const lastInput = { type: 'option_9', value: 1, label: 'a' };
const missInput = { type: 'option_x', value: 1, label: 'a' };

describe('variant (10 options)', () => {
  bench('hit first option', () => {
    return v.safeParse(schema, firstInput);
  });

  bench('hit middle option', () => {
    return v.safeParse(schema, middleInput);
  });

  bench('hit last option', () => {
    return v.safeParse(schema, lastInput);
  });

  bench('miss (invalid discriminator)', () => {
    return v.safeParse(schema, missInput);
  });
});
