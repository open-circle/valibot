import { bench, describe } from 'vitest';
import * as v from '../src/index.ts';

// Baseline coverage (not optimized in this task).
const schema = v.pipe(
  v.string(),
  v.minLength(3),
  v.maxLength(32),
  v.trim()
);

const input = 'hello world';

describe('string pipe', () => {
  bench('valid', () => {
    v.safeParse(schema, input);
  });
});
