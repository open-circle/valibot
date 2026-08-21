import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { compiled } from './compiled.ts';

describe('compiled', () => {
  const LoginSchema = compiled(
    v.object({
      email: v.pipe(v.string(), v.email()),
      password: v.pipe(v.string(), v.minLength(8)),
    })
  );

  test('should have correct schema properties', () => {
    expect(LoginSchema.kind).toBe('schema');
    expect(LoginSchema.type).toBe('compiled');
    expect(LoginSchema.reference).toBe(compiled);
    expect(LoginSchema.expects).toBe('Object');
    expect(LoginSchema.async).toBe(false);
    expect(LoginSchema.schema).toBeDefined();
  });

  test('should parse valid input', () => {
    const result = v.parse(LoginSchema, {
      email: 'user@example.com',
      password: 'securepassword',
    });
    expect(result).toStrictEqual({
      email: 'user@example.com',
      password: 'securepassword',
    });
  });

  test('should strip unknown keys', () => {
    const result = v.parse(LoginSchema, {
      email: 'user@example.com',
      password: 'securepassword',
      extra: 'ignored',
    });
    expect(result).toStrictEqual({
      email: 'user@example.com',
      password: 'securepassword',
    });
  });

  test('should fail for non-object input', () => {
    const result = v.safeParse(LoginSchema, 'not an object');
    expect(result.success).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues![0].type).toBe('object');
  });

  test('should fail for invalid email', () => {
    const result = v.safeParse(LoginSchema, {
      email: 'not-an-email',
      password: 'securepassword',
    });
    expect(result.success).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues![0].type).toBe('email');
  });

  test('should fail for short password', () => {
    const result = v.safeParse(LoginSchema, {
      email: 'user@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues![0].type).toBe('min_length');
  });

  test('should fail for missing keys', () => {
    const result = v.safeParse(LoginSchema, {});
    expect(result.success).toBe(false);
    expect(result.issues!.length).toBeGreaterThanOrEqual(1);
  });

  test('should fail for wrong types', () => {
    const result = v.safeParse(LoginSchema, {
      email: 123,
      password: true,
    });
    expect(result.success).toBe(false);
    expect(result.issues!.length).toBeGreaterThanOrEqual(1);
    expect(result.issues![0].type).toBe('string');
  });

  test('should collect multiple issues', () => {
    const result = v.safeParse(LoginSchema, {
      email: 'not-an-email',
      password: 'short',
    });
    expect(result.success).toBe(false);
    expect(result.issues).toHaveLength(2);
  });

  test('should support abortEarly', () => {
    const result = v.safeParse(
      LoginSchema,
      { email: 'not-an-email', password: 'short' },
      { abortEarly: true }
    );
    expect(result.success).toBe(false);
    expect(result.issues).toHaveLength(1);
  });

  test('should work with simple string schema', () => {
    const StringSchema = compiled(v.string());
    expect(v.parse(StringSchema, 'hello')).toBe('hello');
    expect(v.safeParse(StringSchema, 123).success).toBe(false);
  });
});
