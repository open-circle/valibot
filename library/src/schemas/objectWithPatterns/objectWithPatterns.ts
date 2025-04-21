import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferOutput,
  ObjectPathItem,
  OutputDataset,
  Prettify,
} from '../../types/index.ts';
import {
  _addIssue,
  _getStandardProps,
  _isValidObjectKey,
} from '../../utils/index.ts';
import type { ObjectWithPatternsIssue } from './types.ts';

export type PatternTuple = readonly [
  key: BaseSchema<string, string, BaseIssue<unknown>>,
  value: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
];

export type PatternTuples = readonly [PatternTuple, ...PatternTuple[]];

export type InferPatternInput<TPattern extends PatternTuple> = {
  [K in InferInput<TPattern[0]>]?: InferInput<TPattern[1]>;
};

export type InferPatternsInput<TPatterns extends PatternTuples> =
  TPatterns extends readonly [infer TPattern extends PatternTuple]
    ? InferPatternInput<TPattern>
    : TPatterns extends readonly [
          infer TPattern extends PatternTuple,
          ...infer TRest extends PatternTuples,
        ]
      ? InferPatternInput<TPattern> & InferPatternsInput<TRest>
      : never;

export type InferPatternIssue<TPattern extends PatternTuple> = InferIssue<
  TPattern[number]
>;

export type InferPatternsIssue<TPatterns extends PatternTuples> =
  InferPatternIssue<TPatterns[number]>;

export type InferPatternOutput<TPattern extends PatternTuple> = {
  [K in InferOutput<TPattern[0]>]?: InferOutput<TPattern[1]>;
};

export type InferPatternsOutput<TPatterns extends PatternTuples> =
  TPatterns extends readonly [infer TPattern extends PatternTuple]
    ? InferPatternOutput<TPattern>
    : TPatterns extends readonly [
          infer TPattern extends PatternTuple,
          ...infer TRest extends PatternTuples,
        ]
      ? InferPatternOutput<TPattern> & InferPatternsOutput<TRest>
      : never;

export interface ObjectWithPatternsSchema<
  TPatterns extends PatternTuples,
  TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<ObjectWithPatternsIssue> | undefined,
> extends BaseSchema<
    Prettify<InferPatternsInput<TPatterns>> & {
      [key: string]: InferInput<TRest>;
    },
    Prettify<InferPatternsOutput<TPatterns>> & {
      [key: string]: InferOutput<TRest>;
    },
    ObjectWithPatternsIssue | InferPatternsIssue<TPatterns> | InferIssue<TRest>
  > {
  /**
   * The schema type.
   */
  readonly type: 'object_with_patterns';
  /**
   * The schema reference.
   */
  readonly reference: typeof objectWithPatterns;
  /**
   * The expected property.
   */
  readonly expects: 'Object';
  /**
   * The patterns schema.
   */
  readonly patterns: TPatterns;
  /**
   * The rest schema.
   */
  readonly rest: TRest;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an object schema that matches patterns.
 *
 * @param patterns Pairs of key and value schemas.
 * @param rest Schema to use when no pattern matches.
 *
 * @returns A object schema.
 */
export function objectWithPatterns<
  const TPatterns extends PatternTuples,
  const TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  patterns: TPatterns,
  rest: TRest
): ObjectWithPatternsSchema<TPatterns, TRest, undefined>;

/**
 * Creates an object schema that matches patterns.
 *
 * @param patterns Pairs of key and value schemas.
 * @param rest Schema to use when no pattern matches.
 * @param message The error message.
 *
 * @returns A object schema.
 */
export function objectWithPatterns<
  const TPatterns extends PatternTuples,
  const TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ObjectWithPatternsIssue> | undefined,
>(
  patterns: TPatterns,
  rest: TRest,
  message: TMessage
): ObjectWithPatternsSchema<TPatterns, TRest, TMessage>;

// @__NO_SIDE_EFFECTS__
export function objectWithPatterns(
  patterns: PatternTuples,
  rest: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<ObjectWithPatternsIssue>
): ObjectWithPatternsSchema<
  PatternTuples,
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<ObjectWithPatternsIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'object_with_patterns',
    reference: objectWithPatterns,
    expects: 'Object',
    async: false,
    patterns,
    rest,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (input && typeof input === 'object') {
        // Set typed to `true` and value to empty object
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = {};

        // Parse schema of each pattern
        for (const key in input) {
          // exclude specific keys for security reasons
          if (!_isValidObjectKey(input, key)) continue;

          // Get pattern schema and new key

          let valueSchema:
            | BaseSchema<unknown, unknown, BaseIssue<unknown>>
            | undefined;
          let newKey = key;
          for (const [keySchema, valueSchema_] of patterns) {
            const keyDataset = keySchema['~run']({ value: key }, config);
            if (keyDataset.typed) {
              valueSchema = valueSchema_;
              newKey = keyDataset.value;
              break;
            }
          }

          // if no pattern matches, use rest schema
          if (!valueSchema) {
            valueSchema = rest;
          }

          // @ts-expect-error
          const value = input[key];
          const valueDataset = valueSchema['~run']({ value }, config);

          // If there are issues, capture them
          if (valueDataset.issues) {
            // Create object path item
            const pathItem: ObjectPathItem = {
              type: 'object',
              origin: 'value',
              input: input as Record<string, unknown>,
              key,
              value,
            };

            // Add modified entry dataset issues to issues
            for (const issue of valueDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                // @ts-expect-error
                issue.path = [pathItem];
              }
              // @ts-expect-error
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              // @ts-expect-error
              dataset.issues = valueDataset.issues;
            }

            // If necessary, abort early
            if (config.abortEarly) {
              dataset.typed = false;
              break;
            }
          }

          // If not typed, set typed to `false`
          if (!valueDataset.typed) {
            dataset.typed = false;
          }

          // Add entry to dataset
          // @ts-expect-error
          dataset.value[newKey] = valueDataset.value;
        }
        // Otherwise, add object issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        InferPatternsOutput<PatternTuples> & { [key: string]: unknown },
        | ObjectWithPatternsIssue
        | InferPatternsIssue<PatternTuples>
        | BaseIssue<unknown>
      >;
    },
  };
}
