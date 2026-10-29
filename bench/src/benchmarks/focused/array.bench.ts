import { bench, describe } from 'vitest';
import * as v from '../../../../library/src/index.ts';

const schema = v.array(
  v.object({
    id: v.number(),
    title: v.string(),
    tags: v.array(v.string()),
  })
);

const validInput = Array.from({ length: 100 }, (_, index) => ({
  id: index,
  title: `Item ${index}`,
  tags: ['schema', 'validation'],
}));

const invalidInput = validInput.map((item, index) =>
  index === 0
    ? { ...item, id: 'zero' }
    : index === 99
      ? { ...item, tags: ['schema', 99] }
      : item
);

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
