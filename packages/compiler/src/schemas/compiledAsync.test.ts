import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { compiledAsync } from './compiledAsync.ts';

describe('compiledAsync', () => {
  test('should have correct schema properties', () => {
    const schema = compiledAsync(
      v.objectAsync({
        name: v.string(),
      })
    );
    expect(schema.kind).toBe('schema');
    expect(schema.type).toBe('compiled_async');
    expect(schema.reference).toBe(compiledAsync);
    expect(schema.async).toBe(true);
    expect(schema.schema).toBeDefined();
  });

  test('should parse valid input', async () => {
    const schema = compiledAsync(
      v.objectAsync({
        name: v.string(),
      })
    );
    const result = await v.parseAsync(schema, { name: 'John' });
    expect(result).toStrictEqual({ name: 'John' });
  });

  test('should fail for invalid input', async () => {
    const schema = compiledAsync(
      v.objectAsync({
        name: v.string(),
      })
    );
    const result = await v.safeParseAsync(schema, { name: 123 });
    expect(result.success).toBe(false);
  });
});
