import { describe, expectTypeOf, test } from 'vitest';
import { objectAsync, string } from '../../schemas/index.ts';
import { message } from './message.ts';

describe('message', () => {
  test('should return schema object', () => {
    const schema = string();
    expectTypeOf(message(schema, 'message')).toEqualTypeOf<typeof schema>();
  });

  test('should return async schema object', () => {
    const schema = objectAsync({ key: string() });
    expectTypeOf(message(schema, 'message')).toEqualTypeOf<typeof schema>();
  });
});
