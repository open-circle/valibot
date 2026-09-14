import { bench, describe } from 'vitest';
import * as v from '../../../../library/src/index.ts';

const schema = v.variant('type', [
  v.object({ type: v.literal('user'), id: v.number() }),
  v.object({ type: v.literal('product'), sku: v.string() }),
  v.object({ type: v.literal('order'), total: v.number() }),
]);

const validInput = { type: 'product', sku: 'SKU-1' };
const invalidDiscriminatorInput = { type: 'unknown', value: true };
const invalidSelectedOptionInput = { type: 'product', sku: 123 };

describe('safeParse', () => {
  bench('valid input', () => {
    v.safeParse(schema, validInput);
  });
  bench('invalid discriminator', () => {
    v.safeParse(schema, invalidDiscriminatorInput);
  });
  bench('invalid selected option', () => {
    v.safeParse(schema, invalidSelectedOptionInput);
  });
});
