import { bench, describe } from 'vitest';
import * as v from '../../../../library/src/index.ts';

const schema = v.pipe(v.string(), v.url());
const validInput = 'https://valibot.dev/blog/valibot-v1.4-release-notes/';
const invalidInput = 'invalid-url';

describe('safeParse', () => {
  bench('valid input', () => {
    v.safeParse(schema, validInput);
  });
  bench('invalid input (all errors)', () => {
    v.safeParse(schema, invalidInput);
  });
});
