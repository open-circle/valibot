import { bench, describe } from 'vitest';
import * as v from '../../../../library/src/index.ts';

const schema = v.picklist(['draft', 'review', 'published', 'archived']);
const validFirstInput = 'draft';
const validLastInput = 'archived';
const invalidInput = 'deleted';

describe('safeParse', () => {
  bench('valid input (first option)', () => {
    v.safeParse(schema, validFirstInput);
  });
  bench('valid input (last option)', () => {
    v.safeParse(schema, validLastInput);
  });
  bench('invalid input', () => {
    v.safeParse(schema, invalidInput);
  });
});
