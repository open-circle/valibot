import type { ExamplesAction } from '../../actions/examples/examples.ts';
import type { ArrayInput } from '../../actions/types.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  PipeItem,
  PipeItemAsync,
} from '../../types/index.ts';
import type { SchemaWithPipe, SchemaWithPipeAsync } from '../index.ts';

/**
 * Schema type.
 */
type Schema =
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
  | SchemaWithPipe<
      readonly [
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ...(
          | PipeItem<any, unknown, BaseIssue<unknown>> // eslint-disable-line @typescript-eslint/no-explicit-any
          | ExamplesAction<unknown, ArrayInput>
        )[],
      ]
    >
  | SchemaWithPipeAsync<
      readonly [
        (
          | BaseSchema<unknown, unknown, BaseIssue<unknown>>
          | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
        ),
        ...(
          | PipeItem<any, unknown, BaseIssue<unknown>> // eslint-disable-line @typescript-eslint/no-explicit-any
          | PipeItemAsync<any, unknown, BaseIssue<unknown>> // eslint-disable-line @typescript-eslint/no-explicit-any
          | ExamplesAction<unknown, ArrayInput>
        )[],
      ]
    >;

type RecursiveConcat<
  TRootPipe extends readonly // prettier-ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (| PipeItem<any, unknown, BaseIssue<unknown>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | PipeItemAsync<any, unknown, BaseIssue<unknown>>
  )[],
  TCollectedExamples extends unknown[] = [],
> = TRootPipe extends readonly [
  infer TFirstItem,
  ...infer TPipeRest extends readonly // prettier-ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (| PipeItem<any, unknown, BaseIssue<unknown>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | PipeItemAsync<any, unknown, BaseIssue<unknown>>
  )[],
]
  ? TFirstItem extends
      | SchemaWithPipe<infer TNestedPipe>
      | SchemaWithPipeAsync<infer TNestedPipe>
    ? RecursiveConcat<
        TPipeRest,
        RecursiveConcat<TNestedPipe, TCollectedExamples>
      >
    : TFirstItem extends ExamplesAction<unknown, infer TCurrentExamples>
      ? RecursiveConcat<TPipeRest, [...TCollectedExamples, ...TCurrentExamples]>
      : RecursiveConcat<TPipeRest, TCollectedExamples>
  : TCollectedExamples;

/**
 * Infer examples type.
 */
export type InferExamples<TSchema extends Schema> = TSchema extends
  | SchemaWithPipe<infer TPipe>
  | SchemaWithPipeAsync<infer TPipe>
  ? Readonly<RecursiveConcat<TPipe>>
  : [];

/**
 * Returns the examples of a schema.
 *
 * If multiple examples are defined, it concatenates them using depth-first
 * search. If no examples are defined, an empty array is returned.
 *
 * @param schema The schema to get the examples from.
 *
 * @returns The examples, if any.
 *
 * @beta
 */
// @__NO_SIDE_EFFECTS__
export function getExamples<const TSchema extends Schema>(
  schema: TSchema
): InferExamples<TSchema> {
  const examples: unknown[] = [];
  function depthFirstCollect(schema: Schema): void {
    if ('pipe' in schema) {
      for (const item of schema.pipe) {
        if (item.kind === 'schema' && 'pipe' in item) {
          depthFirstCollect(item);
        } else if (item.kind === 'metadata' && item.type === 'examples') {
          // @ts-expect-error
          examples.push(...item.examples);
        }
      }
    }
  }
  depthFirstCollect(schema);
  // @ts-expect-error
  return examples;
}
