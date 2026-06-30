import { bench, describe } from 'vitest';
import * as v from '../src/index.ts';

// Baseline coverage (not optimized in this task).
const schema = v.array(v.object({ id: v.number(), name: v.string() }));

const input = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `item_${i}`,
}));

describe('array (100 objects)', () => {
  bench('valid', () => {
    v.safeParse(schema, input);
  });
});
