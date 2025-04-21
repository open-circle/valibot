import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferOutput,
  ObjectPathItem,
  OutputDataset,
  Prettify,
} from '../../types/index.ts';
import { _addIssue, _getStandardProps } from '../../utils/index.ts';
import type { objectWithPatterns } from './objectWithPatterns.ts';
import type { ObjectWithPatternsIssue } from './types.ts';

export type PatternTupleAsync = readonly [
  key:
    | BaseSchema<string, string, BaseIssue<unknown>>
    | BaseSchemaAsync<string, string, BaseIssue<unknown>>,
  value:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
];

export type PatternTuplesAsync = readonly [
  PatternTupleAsync,
  ...PatternTupleAsync[],
];

export type InferPatternInputAsync<TPattern extends PatternTupleAsync> = {
  [K in InferInput<TPattern[0]>]?: InferInput<TPattern[1]>;
};

export type InferPatternsInputAsync<TPatterns extends PatternTuplesAsync> =
  TPatterns extends readonly [infer TPattern extends PatternTupleAsync]
    ? InferPatternInputAsync<TPattern>
    : TPatterns extends readonly [
          infer TPattern extends PatternTupleAsync,
          ...infer TRest extends PatternTuplesAsync,
        ]
      ? InferPatternInputAsync<TPattern> & InferPatternsInputAsync<TRest>
      : never;

export type InferPatternIssueAsync<TPattern extends PatternTupleAsync> =
  InferIssue<TPattern[number]>;

export type InferPatternsIssueAsync<TPatterns extends PatternTuplesAsync> =
  InferPatternIssueAsync<TPatterns[number]>;

export type InferPatternOutputAsync<TPattern extends PatternTupleAsync> = {
  [K in InferOutput<TPattern[0]>]?: InferOutput<TPattern[1]>;
};

export type InferPatternsOutputAsync<TPatterns extends PatternTuplesAsync> =
  TPatterns extends readonly [infer TPattern extends PatternTupleAsync]
    ? InferPatternOutputAsync<TPattern>
    : TPatterns extends readonly [
          infer TPattern extends PatternTupleAsync,
          ...infer TRest extends PatternTuplesAsync,
        ]
      ? InferPatternOutputAsync<TPattern> & InferPatternsOutputAsync<TRest>
      : never;

export interface ObjectWithPatternsSchemaAsync<
  TPatterns extends PatternTuplesAsync,
  TRest extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<ObjectWithPatternsIssue> | undefined,
> extends BaseSchemaAsync<
    Prettify<InferPatternsInputAsync<TPatterns>> & {
      [key: string]: InferInput<TRest>;
    },
    Prettify<InferPatternsOutputAsync<TPatterns>> & {
      [key: string]: InferOutput<TRest>;
    },
    | ObjectWithPatternsIssue
    | InferPatternsIssueAsync<TPatterns>
    | InferIssue<TRest>
  > {
  /**
   * The schema type.
   */
  readonly type: 'object_with_patterns';
  /**
   * The schema reference.
   */
  readonly reference:
    | typeof objectWithPatterns
    | typeof objectWithPatternsAsync;
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
 * Creates a object schema that matches patterns.
 *
 * @param patterns Pairs of key and value schemas.
 * @param rest Schema to use when no pattern matches.
 *
 * @returns A object schema.
 */
export function objectWithPatternsAsync<
  const TPatterns extends PatternTuplesAsync,
  const TRest extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
  patterns: TPatterns,
  rest: TRest
): ObjectWithPatternsSchemaAsync<TPatterns, TRest, undefined>;

/**
 * Creates a object schema that matches patterns.
 *
 * @param patterns Pairs of key and value schemas.
 * @param rest Schema to use when no pattern matches.
 * @param message The error message.
 *
 * @returns A object schema.
 */
export function objectWithPatternsAsync<
  const TPatterns extends PatternTuplesAsync,
  const TRest extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ObjectWithPatternsIssue> | undefined,
>(
  patterns: TPatterns,
  rest: TRest,
  message: TMessage
): ObjectWithPatternsSchemaAsync<TPatterns, TRest, TMessage>;

// @__NO_SIDE_EFFECTS__
export function objectWithPatternsAsync(
  patterns: PatternTuplesAsync,
  rest:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<ObjectWithPatternsIssue>
): ObjectWithPatternsSchemaAsync<
  PatternTuplesAsync,
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<ObjectWithPatternsIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'object_with_patterns',
    reference: objectWithPatternsAsync,
    expects: 'Object',
    async: true,
    patterns,
    rest,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (input && typeof input === 'object') {
        // Set typed to `true` and value to empty object
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = {};

        // Parse schema of each pattern
        const datasets = await Promise.all(
          Object.entries(input).map(async ([key, value]) => {
            // Get pattern schema and new key
            let valueSchema:
              | BaseSchema<unknown, unknown, BaseIssue<unknown>>
              | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
              | undefined;
            let newKey = key;
            for (const [keySchema, valueSchema_] of patterns) {
              const keyDataset = await keySchema['~run'](
                { value: key },
                config
              );
              if (keyDataset.typed) {
                valueSchema = valueSchema_;
                newKey = keyDataset.value;
                break;
              }
            }

            // If no pattern matches, use rest schema
            if (!valueSchema) {
              valueSchema = rest;
            }

            const valueDataset = await valueSchema['~run']({ value }, config);
            return [key, newKey, valueDataset] as const;
          })
        );
        for (const [key, newKey, valueDataset] of datasets) {
          // If there are issues, capture them
          if (valueDataset.issues) {
            // Create object path item
            const pathItem: ObjectPathItem = {
              type: 'object',
              origin: 'value',
              input: input as Record<string, unknown>,
              key,
              value: valueDataset.value,
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
        InferPatternsOutputAsync<PatternTuplesAsync> & {
          [key: string]: unknown;
        },
        | ObjectWithPatternsIssue
        | InferPatternsIssueAsync<PatternTuplesAsync>
        | BaseIssue<unknown>
      >;
    },
  };
}
