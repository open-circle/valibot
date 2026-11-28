import { bench, describe } from 'vitest';
import * as v from '../../../../library/src/index.ts';

const fieldCount = 100;

const entries = Object.fromEntries(
  Array.from({ length: fieldCount }, (_, index) => [
    `field_${index}`,
    v.number(),
  ])
);

const validInput = Object.fromEntries(
  Array.from({ length: fieldCount }, (_, index) => [`field_${index}`, index])
);

const schema = v.object(entries);
const invalidInput = {
  ...validInput,
  field_0: 'zero',
  field_99: 'ninety-nine',
};

describe('safeParse', () => {
  bench('valid input', () => {
    v.safeParse(schema, validInput);
  });
  bench('invalid input (all errors)', () => {
    v.safeParse(schema, invalidInput);
  });
  bench('invalid input (abort early)', () => {
    v.safeParse(schema, invalidInput, { abortEarly: true });
  });
});
