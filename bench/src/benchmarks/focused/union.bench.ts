import { bench, describe } from 'vitest';
import * as v from '../../../../library/src/index.ts';

const schema = v.union([
  v.object({ type: v.literal('user'), id: v.number() }),
  v.object({ type: v.literal('product'), sku: v.string() }),
  v.object({ type: v.literal('order'), total: v.number() }),
]);

const validFirstInput = { type: 'user', id: 1 };
const validLastInput = { type: 'order', total: 99 };
const invalidInput = { type: 'unknown', value: true };

describe('safeParse', () => {
  bench('valid input (first option)', () => {
    v.safeParse(schema, validFirstInput);
  });
  bench('valid input (last option)', () => {
    v.safeParse(schema, validLastInput);
  });
  bench('invalid input (all errors)', () => {
    v.safeParse(schema, invalidInput);
  });
});
