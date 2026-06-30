import { bench, describe } from 'vitest';
import * as v from '../src/index.ts';

// Large allow-list, e.g. an ISO-style country/option code set.
const values = Array.from({ length: 200 }, (_, i) => `code_${i}`);
const schema = v.picklist(values);

const hitFirst = 'code_0';
const hitLast = 'code_199';
const miss = 'code_missing';

describe('picklist (200 options)', () => {
  bench('hit first', () => {
    v.safeParse(schema, hitFirst);
  });

  bench('hit last', () => {
    v.safeParse(schema, hitLast);
  });

  bench('miss', () => {
    v.safeParse(schema, miss);
  });
});
