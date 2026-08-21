import { bench, describe } from 'vitest';
import * as v from '../src/index.ts';

// Regression guard for array validation throughput.
const schema = v.array(v.object({ id: v.number(), name: v.string() }));

const input = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `item_${i}`,
}));

describe('array (100 objects)', () => {
  bench('valid', () => {
    return v.safeParse(schema, input);
  });
});
