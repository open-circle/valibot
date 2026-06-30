import { bench, describe } from 'vitest';
import * as v from '../src/index.ts';

// Large string enum (~200 members).
const enumObject: Record<string, string> = {};
for (let i = 0; i < 200; i++) {
  enumObject[`KEY_${i}`] = `value_${i}`;
}
const schema = v.enum(enumObject);

const hitFirst = 'value_0';
const hitLast = 'value_199';
const miss = 'value_missing';

describe('enum (200 members)', () => {
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
