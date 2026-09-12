import { bench, describe } from 'vitest';
import * as v from '../src/index.ts';

// Flat schema of primitive entries so the measurement isolates the top-level
// object entry loop, not array or nested-object validation.
const schema = v.object({
  id: v.number(),
  name: v.string(),
  active: v.boolean(),
  count: v.number(),
  label: v.string(),
  enabled: v.boolean(),
});

const fullInput = {
  id: 1,
  name: 'test',
  active: true,
  count: 2,
  label: 'x',
  enabled: false,
};

const missingKeyInput = {
  id: 1,
  name: 'test',
  active: true,
  count: 2,
  label: 'x',
  // `enabled` missing -> required-key path
};

describe('object', () => {
  bench('all keys present (happy path)', () => {
    return v.safeParse(schema, fullInput);
  });

  bench('missing required key', () => {
    return v.safeParse(schema, missingKeyInput);
  });
});
