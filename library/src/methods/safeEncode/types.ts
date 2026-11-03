import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferInput,
  InferIssue,
} from '../../types/index.ts';

/**
 * Safe encode result type.
 */
export type SafeEncodeResult<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> =
  | {
      /**
       * Whether it's typed.
       */
      readonly typed: true;
      /**
       * Whether it's successful.
       */
      readonly success: true;
      /**
       * The output value.
       */
      readonly output: InferInput<TSchema>;
      /**
       * The issues, if any.
       */
      readonly issues: undefined;
    }
  | {
      readonly typed: true;
      readonly success: false;
      readonly output: InferInput<TSchema>;
      readonly issues: [InferIssue<TSchema>, ...InferIssue<TSchema>[]];
    }
  | {
      readonly typed: false;
      readonly success: false;
      readonly output: unknown;
      readonly issues: [InferIssue<TSchema>, ...InferIssue<TSchema>[]];
    };
