import { bench, describe } from 'vitest';
import * as v from '../../../../library/src/index.ts';

enum Status {
  Draft = 'draft',
  Review = 'review',
  Published = 'published',
  Archived = 'archived',
}

const schema = v.enum(Status);
const validFirstInput = Status.Draft;
const validLastInput = Status.Archived;
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
