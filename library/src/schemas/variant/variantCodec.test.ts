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
});
