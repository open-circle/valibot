import { describe, expect, test } from 'vitest';
import * as v from '../../index.ts';

describe('variant codec discriminator issues', () => {
  const discriminator = v.codec(v.literal('encoded'), v.literal('decoded'), {
    decode: () => 'decoded' as const,
    encode: () => 'encoded' as const,
  });
  const pipeline = v.pipe(v.string(), discriminator);

  test.each([
    { type: discriminator, expected: '"encoded"' },
    { type: pipeline, expected: 'string' },
  ])(
    'reports decoded expectations when encoding $type.type',
    ({ type, expected }) => {
      const schema = v.variant('type', [v.object({ type })]);
      expect(v.safeEncode(schema, { type: 'invalid' } as never)).toMatchObject({
        success: false,
        issues: [
          {
            type: 'variant',
            expected: '"decoded"',
            path: [{ key: 'type', value: 'invalid' }],
          },
        ],
      });
      expect(v.safeDecode(schema, { type: 'invalid' } as never)).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected }],
      });
      expect(v.safeEncode(schema, {} as never)).toMatchObject({
        success: false,
        issues: [
          {
            type: 'variant',
            expected: '"decoded"',
            path: [{ key: 'type', value: undefined }],
          },
        ],
      });
    }
  );

  test.each([
    { type: v.optional(discriminator), expected: '("decoded" | undefined)' },
    { type: v.nullable(discriminator), expected: '("decoded" | null)' },
    {
      type: v.nullish(discriminator),
      expected: '("decoded" | null | undefined)',
    },
    {
      type: v.undefinedable(discriminator),
      expected: '("decoded" | undefined)',
    },
    { type: v.exactOptional(discriminator), expected: '"decoded"' },
    {
      type: v.optional(v.nullable(pipeline)),
      expected: '(("decoded" | null) | undefined)',
    },
  ])(
    'reports decoded expectations through $type.type wrappers',
    ({ type, expected }) => {
      const schema = v.variant('type', [v.object({ type })]);
      expect(v.safeEncode(schema, { type: 'invalid' } as never)).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected }],
      });
      expect(v.safeDecode(schema, { type: 'invalid' } as never)).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected: type.expects }],
      });
    }
  );

  const discriminatorAsync = v.codecAsync(
    v.literal('encoded'),
    v.literal('decoded'),
    {
      decode: async () => 'decoded' as const,
      encode: async () => 'encoded' as const,
    }
  );
  const pipelineAsync = v.pipeAsync(v.string(), discriminatorAsync);

  test.each([
    { type: discriminatorAsync, expected: '"encoded"' },
    { type: pipelineAsync, expected: 'string' },
  ])(
    'reports decoded expectations when encoding $type.type asynchronously',
    async ({ type, expected }) => {
      const schema = v.variantAsync('type', [v.objectAsync({ type })]);
      expect(
        await v.safeEncodeAsync(schema, { type: 'invalid' } as never)
      ).toMatchObject({
        success: false,
        issues: [
          {
            type: 'variant',
            expected: '"decoded"',
            path: [{ key: 'type', value: 'invalid' }],
          },
        ],
      });
      expect(
        await v.safeDecodeAsync(schema, { type: 'invalid' } as never)
      ).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected }],
      });
      expect(await v.safeEncodeAsync(schema, {} as never)).toMatchObject({
        success: false,
        issues: [
          {
            type: 'variant',
            expected: '"decoded"',
            path: [{ key: 'type', value: undefined }],
          },
        ],
      });
    }
  );

  test.each([
    {
      type: v.optionalAsync(discriminatorAsync),
      expected: '("decoded" | undefined)',
    },
    {
      type: v.nullableAsync(discriminatorAsync),
      expected: '("decoded" | null)',
    },
    {
      type: v.nullishAsync(discriminatorAsync),
      expected: '("decoded" | null | undefined)',
    },
    {
      type: v.undefinedableAsync(discriminatorAsync),
      expected: '("decoded" | undefined)',
    },
    { type: v.exactOptionalAsync(discriminatorAsync), expected: '"decoded"' },
    {
      type: v.optionalAsync(v.nullableAsync(pipelineAsync)),
      expected: '(("decoded" | null) | undefined)',
    },
  ])(
    'reports decoded expectations through async $type.type wrappers',
    async ({ type, expected }) => {
      const schema = v.variantAsync('type', [v.objectAsync({ type })]);
      expect(
        await v.safeEncodeAsync(schema, { type: 'invalid' } as never)
      ).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected }],
      });
      expect(
        await v.safeDecodeAsync(schema, { type: 'invalid' } as never)
      ).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected: type.expects }],
      });
    }
  );
});
