import { describe, expectTypeOf, test } from 'vitest';
import * as v from '../../index.ts';

describe('codec types', () => {
  const encoded = v.string();
  const decoded = v.date();
  const schema = v.codec(encoded, decoded, {
    decode: (value, context) => {
      expectTypeOf(value).toEqualTypeOf<string>();
      expectTypeOf(context.NEVER).toEqualTypeOf<never>();
      return new Date(value);
    },
    encode: (value) => {
      expectTypeOf(value).toEqualTypeOf<Date>();
      return value.toISOString();
    },
  });

  test('infers schema input, output, issues and exposed endpoints', () => {
    expectTypeOf<v.InferInput<typeof schema>>().toEqualTypeOf<string>();
    expectTypeOf<v.InferOutput<typeof schema>>().toEqualTypeOf<Date>();
    expectTypeOf<v.InferIssue<typeof schema>>().toEqualTypeOf<
      v.StringIssue | v.DateIssue | v.CodecIssue<unknown>
    >();
    expectTypeOf(schema.encoded).toEqualTypeOf<typeof encoded>();
    expectTypeOf(schema.decoded).toEqualTypeOf<typeof decoded>();
  });

  test('infers nested directional results and safe result narrowing', () => {
    const nested = v.object({
      dates: v.array(schema),
      optional: v.optional(schema),
    });
    expectTypeOf(v.decode(nested, { dates: ['2026-11-03'] })).toEqualTypeOf<{
      dates: Date[];
      optional?: Date | undefined;
    }>();
    expectTypeOf(v.encode(nested, { dates: [new Date()] })).toEqualTypeOf<{
      dates: string[];
      optional?: string | undefined;
    }>();
    const result = v.safeEncode(nested, { dates: [new Date()] });
    if (result.success) {
      expectTypeOf(result.output).toEqualTypeOf<v.InferInput<typeof nested>>();
      expectTypeOf(result.issues).toEqualTypeOf<undefined>();
    }
  });

  test('requires directional input types while parse accepts unknown', () => {
    expectTypeOf(v.decode<typeof schema>)
      .parameter(1)
      .toEqualTypeOf<string>();
    expectTypeOf(v.encode<typeof schema>)
      .parameter(1)
      .toEqualTypeOf<Date>();
    expectTypeOf(v.safeDecode<typeof schema>)
      .parameter(1)
      .toEqualTypeOf<string>();
    expectTypeOf(v.safeEncode<typeof schema>)
      .parameter(1)
      .toEqualTypeOf<Date>();
    expectTypeOf(v.parse<typeof schema>)
      .parameter(1)
      .toEqualTypeOf<unknown>();
  });

  test('connects endpoint output to endpoint input for nested codecs', () => {
    const numeric = v.codec(v.string(), v.number(), {
      decode: Number,
      encode: String,
    });
    const epoch = v.codec(v.number(), v.date(), {
      decode: (value) => new Date(value),
      encode: (value) => value.getTime(),
    });
    const combined = v.codec(numeric, epoch, {
      decode: (value) => {
        expectTypeOf(value).toEqualTypeOf<number>();
        return value * 1000;
      },
      encode: (value) => {
        expectTypeOf(value).toEqualTypeOf<number>();
        return value / 1000;
      },
    });
    expectTypeOf(combined).toExtend<v.GenericSchema<string, Date>>();
    expectTypeOf<v.InferInput<typeof combined>>().toEqualTypeOf<string>();
    expectTypeOf<v.InferOutput<typeof combined>>().toEqualTypeOf<Date>();
  });

  test('requires explicit async codec construction and infers async results', () => {
    expectTypeOf<
      v.CodecOperations<typeof encoded, typeof decoded>['decode']
    >().returns.toEqualTypeOf<Date>();
    expectTypeOf<
      v.CodecOperationsAsync<typeof encoded, typeof decoded>['decode']
    >().returns.toEqualTypeOf<Date | Promise<Date>>();
    const asyncSchema = v.codecAsync(encoded, decoded, {
      decode: async (value) => new Date(value),
      encode: async (value) => value.toISOString(),
    });
    expectTypeOf(v.decodeAsync(asyncSchema, '')).toEqualTypeOf<Promise<Date>>();
    expectTypeOf(v.encodeAsync(asyncSchema, new Date())).toEqualTypeOf<
      Promise<string>
    >();
    expectTypeOf(v.safeEncodeAsync(asyncSchema, new Date())).toEqualTypeOf<
      Promise<v.SafeEncodeResult<typeof asyncSchema>>
    >();
    expectTypeOf(asyncSchema).not.toExtend<v.GenericSchema>();
  });
});
