import { describe, expectTypeOf, test } from 'vitest';
import type {
  Brand,
  BrandAction,
  DescriptionAction,
  ReadonlyAction,
  TransformAction,
} from '../../actions/index.ts';
import type { SchemaWithPipe } from '../../methods/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import type { AnySchema } from '../any/index.ts';
import type { CustomIssue, CustomSchema } from '../custom/index.ts';
import type { ExactOptionalSchema } from '../exactOptional/index.ts';
import type { NullishSchema } from '../nullish/index.ts';
import type { NumberIssue, NumberSchema } from '../number/index.ts';
import type { ObjectIssue, ObjectSchema } from '../object/index.ts';
import type { OptionalSchema } from '../optional/index.ts';
import {
  string,
  type StringIssue,
  type StringSchema,
} from '../string/index.ts';
import type { UndefinedableSchema } from '../undefinedable/index.ts';
import type { UnknownSchema } from '../unknown/index.ts';
import { looseObject, type LooseObjectSchema } from './looseObject.ts';
import type { LooseObjectIssue } from './types.ts';

describe('looseObject', () => {
  describe('should return schema object', () => {
    const entries = { key: string() };
    type Entries = typeof entries;

    test('with undefined message', () => {
      type Schema = LooseObjectSchema<Entries, undefined>;
      expectTypeOf(looseObject(entries)).toEqualTypeOf<Schema>();
      expectTypeOf(looseObject(entries, undefined)).toEqualTypeOf<Schema>();
    });

    test('with string message', () => {
      expectTypeOf(looseObject(entries, 'message')).toEqualTypeOf<
        LooseObjectSchema<Entries, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(looseObject(entries, () => 'message')).toEqualTypeOf<
        LooseObjectSchema<Entries, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Schema = LooseObjectSchema<
      {
        key00: StringSchema<undefined>;
        key01: AnySchema;
        key02: UnknownSchema;
        key03: ObjectSchema<{ key: NumberSchema<undefined> }, undefined>;
        key04: SchemaWithPipe<
          [StringSchema<undefined>, ReadonlyAction<string>]
        >;
        key05: UndefinedableSchema<StringSchema<undefined>, 'bar'>;
        key06: SchemaWithPipe<
          [
            OptionalSchema<StringSchema<undefined>, undefined>,
            TransformAction<undefined | string, number>,
          ]
        >;
        key07: CustomSchema<`a${string}` | `b${string}`, undefined>;
        key08: SchemaWithPipe<
          [StringSchema<undefined>, BrandAction<string, 'foo'>]
        >;

        // ExactOptionalSchema
        key10: ExactOptionalSchema<StringSchema<undefined>, undefined>;
        key11: ExactOptionalSchema<StringSchema<undefined>, 'foo'>;
        key12: ExactOptionalSchema<StringSchema<undefined>, () => 'foo'>;

        // OptionalSchema
        key20: OptionalSchema<StringSchema<undefined>, undefined>;
        key21: OptionalSchema<StringSchema<undefined>, 'foo'>;
        key22: OptionalSchema<StringSchema<undefined>, () => undefined>;
        key23: OptionalSchema<StringSchema<undefined>, () => 'foo'>;

        // NullishSchema
        key30: NullishSchema<StringSchema<undefined>, undefined>;
        key31: NullishSchema<StringSchema<undefined>, null>;
        key32: NullishSchema<StringSchema<undefined>, 'foo'>;
        key33: NullishSchema<StringSchema<undefined>, () => undefined>;
        key34: NullishSchema<StringSchema<undefined>, () => null>;
        key35: NullishSchema<StringSchema<undefined>, () => 'foo'>;

        // SchemaWithPipe
        key40: SchemaWithPipe<
          [ExactOptionalSchema<StringSchema<undefined>, undefined>]
        >;
        key41: SchemaWithPipe<
          [
            ExactOptionalSchema<StringSchema<undefined>, undefined>,
            DescriptionAction<string, 'foo'>,
          ]
        >;
        key42: SchemaWithPipe<
          [OptionalSchema<StringSchema<undefined>, undefined>]
        >;
        key43: SchemaWithPipe<
          [
            OptionalSchema<StringSchema<undefined>, undefined>,
            DescriptionAction<string | undefined, 'foo'>,
          ]
        >;
        key44: SchemaWithPipe<
          [NullishSchema<StringSchema<undefined>, undefined>]
        >;
        key45: SchemaWithPipe<
          [
            NullishSchema<StringSchema<undefined>, undefined>,
            DescriptionAction<string | null | undefined, 'foo'>,
          ]
        >;
        key46: SchemaWithPipe<
          [
            NullishSchema<StringSchema<undefined>, undefined>,
            TransformAction<string | null | undefined, string[]>,
          ]
        >;
      },
      undefined
    >;

    test('of input', () => {
      expectTypeOf<InferInput<Schema>>().toEqualTypeOf<
        {
          key00: string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          key01: any;
          key02: unknown;
          key03: { key: number };
          key04: string;
          key05: string | undefined;
          key06?: string | undefined;
          key07: `a${string}` | `b${string}`;
          key08: string;

          // ExactOptionalSchema
          key10?: string;
          key11?: string;
          key12?: string;

          // OptionalSchema
          key20?: string | undefined;
          key21?: string | undefined;
          key22?: string | undefined;
          key23?: string | undefined;

          // NullishSchema
          key30?: string | null | undefined;
          key31?: string | null | undefined;
          key32?: string | null | undefined;
          key33?: string | null | undefined;
          key34?: string | null | undefined;
          key35?: string | null | undefined;

          // SchemaWithPipe
          key40?: string;
          key41?: string;
          key42?: string | undefined;
          key43?: string | undefined;
          key44?: string | null | undefined;
          key45?: string | null | undefined;
          key46?: string | null | undefined;
        } & { [key: string]: unknown }
      >();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
        {
          key00: string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          key01: any;
          key02: unknown;
          key03: { key: number };
          readonly key04: string;
          key05: string;
          key06?: number;
          key07: `a${string}` | `b${string}`;
          key08: string & Brand<'foo'>;

          // ExactOptionalSchema
          key10?: string;
          key11: string;
          key12: string;

          // OptionalSchema
          key20?: string | undefined;
          key21: string;
          key22: string | undefined;
          key23: string;

          // NullishSchema
          key30?: string | null | undefined;
          key31: string | null;
          key32: string;
          key33: string | undefined;
          key34: string | null;
          key35: string;

          // SchemaWithPipe
          key40?: string;
          key41?: string;
          key42?: string | undefined;
          key43?: string | undefined;
          key44?: string | null | undefined;
          key45?: string | null | undefined;
          key46?: string[];
        } & { [key: string]: unknown }
      >();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
        LooseObjectIssue | ObjectIssue | StringIssue | NumberIssue | CustomIssue
      >();
    });
  });
});
