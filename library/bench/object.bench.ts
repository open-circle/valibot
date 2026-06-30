import { bench, describe } from 'vitest';
import * as v from '../src/index.ts';

const schema = v.object({
  id: v.number(),
  name: v.string(),
  active: v.boolean(),
  tags: v.array(v.string()),
  nested: v.object({
    a: v.number(),
    b: v.string(),
  }),
});

const fullInput = {
  id: 1,
  name: 'test',
  active: true,
  tags: ['a', 'b', 'c'],
  nested: { a: 1, b: 'x' },
};

const missingKeyInput = {
  id: 1,
  name: 'test',
  active: true,
  tags: ['a', 'b', 'c'],
  // `nested` missing -> required-key path
};

describe('object', () => {
  bench('all keys present (happy path)', () => {
    v.safeParse(schema, fullInput);
  });

  bench('missing required key', () => {
    v.safeParse(schema, missingKeyInput);
  });
});
