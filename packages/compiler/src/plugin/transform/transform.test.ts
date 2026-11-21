import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { compiled } from '../../schemas/compiled.ts';
import { analyzeCode } from '../analyze/index.ts';
import { transformCode } from './transform.ts';

describe('analyzeCode', () => {
  test('should find compiled() calls with namespace import', () => {
    const code = `
      import * as v from 'valibot';
      import { compiled } from '@valibot/compiler';
      const schema = compiled(v.object({
        name: v.string(),
      }));
    `;
    const calls = analyzeCode(code, 'test.ts');
    expect(calls).toHaveLength(1);
    expect(calls[0].node.kind).toBe('schema');
    expect((calls[0].node as { type: string }).type).toBe('object');
    expect(calls[0].valibotBinding).toBe('v');
    expect(calls[0].compiledBinding).toBe('compiled');
  });

  test('should handle pipe with string + email', () => {
    const code = `
      import * as v from 'valibot';
      import { compiled } from '@valibot/compiler';
      const schema = compiled(v.object({
        email: v.pipe(v.string(), v.email()),
      }));
    `;
    const calls = analyzeCode(code, 'test.ts');
    expect(calls).toHaveLength(1);

    const obj = calls[0].node;
    expect(obj.kind).toBe('schema');
    expect((obj as { type: string }).type).toBe('object');

    const entries = (obj as { entries: Record<string, unknown> }).entries;
    const emailEntry = entries.email as {
      kind: string;
      schema: { type: string };
      actions: Array<{ type: string }>;
    };
    expect(emailEntry.kind).toBe('pipe');
    expect(emailEntry.schema.type).toBe('string');
    expect(emailEntry.actions).toHaveLength(1);
    expect(emailEntry.actions[0].type).toBe('email');
  });

  test('should handle pipe with string + minLength', () => {
    const code = `
      import * as v from 'valibot';
      import { compiled } from '@valibot/compiler';
      const schema = compiled(v.object({
        password: v.pipe(v.string(), v.minLength(8)),
      }));
    `;
    const calls = analyzeCode(code, 'test.ts');
    expect(calls).toHaveLength(1);

    const entries = (calls[0].node as { entries: Record<string, unknown> })
      .entries;
    const pwEntry = entries.password as {
      kind: string;
      actions: Array<{ type: string; requirement: number }>;
    };
    expect(pwEntry.kind).toBe('pipe');
    expect(pwEntry.actions).toHaveLength(1);
    expect(pwEntry.actions[0].type).toBe('minLength');
    expect(pwEntry.actions[0].requirement).toBe(8);
  });

  test('should skip files without @valibot/compiler import', () => {
    const code = `
      import * as v from 'valibot';
      const schema = v.object({ name: v.string() });
    `;
    const calls = analyzeCode(code, 'test.ts');
    expect(calls).toHaveLength(0);
  });

  test('should skip files without valibot namespace import', () => {
    const code = `
      import { object, string } from 'valibot';
      import { compiled } from '@valibot/compiler';
      const schema = compiled(object({ name: string() }));
    `;
    const calls = analyzeCode(code, 'test.ts');
    expect(calls).toHaveLength(0);
  });

  test('should skip unsupported schemas', () => {
    const code = `
      import * as v from 'valibot';
      import { compiled } from '@valibot/compiler';
      const schema = compiled(v.array(v.string()));
    `;
    const calls = analyzeCode(code, 'test.ts');
    expect(calls).toHaveLength(0);
  });
});

describe('transformCode', () => {
  test('should return undefined for non-compiler code', () => {
    const code = `import * as v from 'valibot'; const s = v.string();`;
    expect(transformCode(code, 'test.ts')).toBeUndefined();
  });

  test('should transform compiled() calls', () => {
    const code = `
import * as v from 'valibot';
import { compiled } from '@valibot/compiler';
const LoginSchema = compiled(v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
}));
`;
    const result = transformCode(code, 'test.ts');
    expect(result).toBeDefined();
    expect(result!.code).toContain("kind: 'schema'");
    expect(result!.code).toContain("type: 'compiled'");
    expect(result!.code).toContain("'~run'");
    expect(result!.code).toContain('typeof v0$');
    expect(result!.code).toContain('typeof v1$');
    expect(result!.code).toContain('EMAIL_REGEX');
    expect(result!.code).toContain('.length < 8');
    expect(result!.map).toBeDefined();
  });

  test('compiled transform produces correct validation results', () => {
    const code = `
import * as v from 'valibot';
import { compiled } from '@valibot/compiler';
export const LoginSchema = compiled(v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
}));
`;
    const result = transformCode(code, 'test.ts');
    expect(result).toBeDefined();

    // Strip import/export statements so we can evaluate in a Function context
    const evalCode = result!.code
      .replace(/^import\s+.*$/gm, '')
      .replace(/^export\s+/gm, '');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const evalFn = new Function(
      'v',
      'compiled',
      `${evalCode}\nreturn LoginSchema;`
    );
    const transformedSchema = evalFn(v, compiled);

    // Test valid input
    const validResult = v.safeParse(transformedSchema, {
      email: 'user@example.com',
      password: 'securepassword',
    });
    expect(validResult.success).toBe(true);
    expect(validResult.output).toStrictEqual({
      email: 'user@example.com',
      password: 'securepassword',
    });

    // Test non-object input
    const nonObjectResult = v.safeParse(transformedSchema, 'not an object');
    expect(nonObjectResult.success).toBe(false);
    expect(nonObjectResult.issues![0].type).toBe('object');

    // Test invalid email
    const invalidEmailResult = v.safeParse(transformedSchema, {
      email: 'invalid',
      password: 'securepassword',
    });
    expect(invalidEmailResult.success).toBe(false);
    expect(invalidEmailResult.issues![0].type).toBe('email');
    expect(invalidEmailResult.issues![0].path).toBeDefined();
    expect(invalidEmailResult.issues![0].path![0].key).toBe('email');

    // Test short password
    const shortPwResult = v.safeParse(transformedSchema, {
      email: 'user@example.com',
      password: 'short',
    });
    expect(shortPwResult.success).toBe(false);
    expect(shortPwResult.issues![0].type).toBe('min_length');
    expect(shortPwResult.issues![0].path![0].key).toBe('password');

    // Test missing keys
    const missingResult = v.safeParse(transformedSchema, {});
    expect(missingResult.success).toBe(false);
    expect(missingResult.issues!.length).toBeGreaterThanOrEqual(1);

    // Test wrong types
    const wrongTypeResult = v.safeParse(transformedSchema, {
      email: 123,
      password: true,
    });
    expect(wrongTypeResult.success).toBe(false);
    expect(wrongTypeResult.issues![0].type).toBe('string');

    // Test multiple issues collected
    const multiIssueResult = v.safeParse(transformedSchema, {
      email: 'invalid',
      password: 'short',
    });
    expect(multiIssueResult.success).toBe(false);
    expect(multiIssueResult.issues).toHaveLength(2);

    // Test abortEarly
    const abortResult = v.safeParse(
      transformedSchema,
      { email: 'invalid', password: 'short' },
      { abortEarly: true }
    );
    expect(abortResult.success).toBe(false);
    expect(abortResult.issues).toHaveLength(1);
  });

  test('should handle top-level pipe with actions', () => {
    const code = `
import * as v from 'valibot';
import { compiled } from '@valibot/compiler';
export const EmailSchema = compiled(v.pipe(v.string(), v.email()));
`;
    const result = transformCode(code, 'test.ts');
    expect(result).toBeDefined();

    const evalCode = result!.code
      .replace(/^import\s+.*$/gm, '')
      .replace(/^export\s+/gm, '');
    const evalFn = new Function(
      'v',
      'compiled',
      `${evalCode}\nreturn EmailSchema;`
    );
    const schema = evalFn(v, compiled);

    // Valid email passes
    expect(v.safeParse(schema, 'user@example.com').success).toBe(true);

    // Non-string fails
    expect(v.safeParse(schema, 123).success).toBe(false);

    // Invalid email fails (action must not be dropped)
    const invalidResult = v.safeParse(schema, 'not-an-email');
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.issues![0].type).toBe('email');
  });

  test('should handle non-identifier object keys', () => {
    const code = `
import * as v from 'valibot';
import { compiled } from '@valibot/compiler';
export const Schema = compiled(v.object({
  "my-field": v.string(),
  "class": v.string(),
}));
`;
    const result = transformCode(code, 'test.ts');
    expect(result).toBeDefined();

    const evalCode = result!.code
      .replace(/^import\s+.*$/gm, '')
      .replace(/^export\s+/gm, '');
    const evalFn = new Function('v', 'compiled', `${evalCode}\nreturn Schema;`);
    const schema = evalFn(v, compiled);

    const valid = v.safeParse(schema, {
      'my-field': 'hello',
      class: 'world',
    });
    expect(valid.success).toBe(true);
    expect(valid.output).toStrictEqual({
      'my-field': 'hello',
      class: 'world',
    });
  });

  test('should handle renamed imports', () => {
    const code = `
import * as val from 'valibot';
import { compiled as c } from '@valibot/compiler';
export const Schema = c(val.object({ name: val.string() }));
`;
    const result = transformCode(code, 'test.ts');
    expect(result).toBeDefined();

    const evalCode = result!.code
      .replace(/^import\s+.*$/gm, '')
      .replace(/^export\s+/gm, '');
    const evalFn = new Function('val', 'c', `${evalCode}\nreturn Schema;`);
    const schema = evalFn(v, compiled);

    expect(v.safeParse(schema, { name: 'John' }).success).toBe(true);
    expect(v.safeParse(schema, { name: 123 }).success).toBe(false);
  });

  test('should handle multiple compiled() calls in one file', () => {
    const code = `
import * as v from 'valibot';
import { compiled } from '@valibot/compiler';
export const SchemaA = compiled(v.object({ a: v.string() }));
export const SchemaB = compiled(v.object({ b: v.string() }));
`;
    const result = transformCode(code, 'test.ts');
    expect(result).toBeDefined();

    const evalCode = result!.code
      .replace(/^import\s+.*$/gm, '')
      .replace(/^export\s+/gm, '');
    const evalFn = new Function(
      'v',
      'compiled',
      `${evalCode}\nreturn { SchemaA, SchemaB };`
    );
    const { SchemaA, SchemaB } = evalFn(v, compiled);

    expect(v.safeParse(SchemaA, { a: 'hello' }).success).toBe(true);
    expect(v.safeParse(SchemaA, { b: 'hello' }).success).toBe(false);
    expect(v.safeParse(SchemaB, { b: 'hello' }).success).toBe(true);
    expect(v.safeParse(SchemaB, { a: 'hello' }).success).toBe(false);
  });
});
