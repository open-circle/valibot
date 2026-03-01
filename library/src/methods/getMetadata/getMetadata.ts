import type { MetadataAction } from '../../actions/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Merge,
  PipeItem,
  PipeItemAsync,
  Prettify,
} from '../../types/index.ts';
import type { SchemaWithPipe, SchemaWithPipeAsync } from '../pipe/index.ts';

export namespace getMetadata {
  /**
   * Schema type.
   */
  export type Schema =
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
    | SchemaWithPipe<
        readonly [
          BaseSchema<unknown, unknown, BaseIssue<unknown>>,
          ...(
            | PipeItem<any, unknown, BaseIssue<unknown>> // eslint-disable-line @typescript-eslint/no-explicit-any
            | MetadataAction<unknown, Record<string, unknown>>
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
            | MetadataAction<unknown, Record<string, unknown>>
          )[],
        ]
      >;
}

/**
 * Basic pipe item type.
 */
type BasicPipeItem =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | PipeItem<any, unknown, BaseIssue<unknown>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | PipeItemAsync<any, unknown, BaseIssue<unknown>>
  | MetadataAction<unknown, Record<string, unknown>>;

/**
 * Recursive merge type.
 */
type RecursiveMerge<
  TRootPipe extends readonly BasicPipeItem[],
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  TCollectedMetadata extends Record<string, unknown> = {},
> = TRootPipe extends readonly [
  infer TFirstItem,
  ...infer TPipeRest extends readonly BasicPipeItem[],
]
  ? TFirstItem extends
      | SchemaWithPipe<infer TNestedPipe>
      | SchemaWithPipeAsync<infer TNestedPipe>
    ? RecursiveMerge<TPipeRest, RecursiveMerge<TNestedPipe, TCollectedMetadata>>
    : TFirstItem extends MetadataAction<unknown, infer TCurrentMetadata>
      ? RecursiveMerge<TPipeRest, Merge<TCollectedMetadata, TCurrentMetadata>>
      : RecursiveMerge<TPipeRest, TCollectedMetadata>
  : TCollectedMetadata;

/**
 * Infer metadata type.
 *
 * @beta
 */
export type InferMetadata<TSchema extends getMetadata.Schema> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BaseSchema<any, any, any> extends TSchema
    ? Record<string, unknown>
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      BaseSchemaAsync<any, any, any> extends TSchema
      ? Record<string, unknown>
      : TSchema extends
            | SchemaWithPipe<infer TPipe>
            | SchemaWithPipeAsync<infer TPipe>
        ? Prettify<RecursiveMerge<TPipe>>
        : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
          {};

/**
 * Returns the metadata of a schema.
 *
 * If multiple metadata are defined, it shallowly merges them using depth-first
 * search. If no metadata is defined, an empty object is returned.
 *
 * @param schema Schema to get the metadata from.
 *
 * @returns The metadata, if any.
 *
 * @beta
 */
// @__NO_SIDE_EFFECTS__
export function getMetadata<const TSchema extends getMetadata.Schema>(
  schema: TSchema
): InferMetadata<TSchema> {
  const result = {};
  function depthFirstMerge(schema: getMetadata.Schema): void {
    if ('pipe' in schema) {
      for (const item of schema.pipe) {
        if (item.kind === 'schema' && 'pipe' in item) {
          depthFirstMerge(item);
        } else if (item.kind === 'metadata' && item.type === 'metadata') {
          // @ts-expect-error
          Object.assign(result, item.metadata);
        }
      }
    }
  }
  depthFirstMerge(schema);
  // @ts-expect-error
  return result;
}
