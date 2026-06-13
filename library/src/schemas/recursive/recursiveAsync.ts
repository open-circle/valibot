import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferInput,
  InferIssue,
  InferOutput,
  MaybePromise,
  OutputDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';
import type {
  recursive,
  RecursiveMarker,
  ResolveRecursiveInput,
  ResolveRecursiveOutput,
} from './recursive.ts';

/**
 * Recursive self schema async interface.
 *
 * @internal
 */
export interface RecursiveSelfSchemaAsync
  extends BaseSchemaAsync<RecursiveMarker, RecursiveMarker, never> {
  /**
   * The schema type.
   */
  readonly type: 'recursive';
}

/**
 * Recursive schema async interface.
 */
export interface RecursiveSchemaAsync<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> extends BaseSchemaAsync<
    ResolveRecursiveInput<InferInput<TWrapped>>,
    ResolveRecursiveOutput<InferOutput<TWrapped>>,
    InferIssue<TWrapped>
  > {
  /**
   * The schema type.
   */
  readonly type: 'recursive';
  /**
   * The schema reference.
   */
  readonly reference: typeof recursive | typeof recursiveAsync;
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The schema getter.
   */
  readonly getter: (self: RecursiveSelfSchemaAsync) => MaybePromise<TWrapped>;
}

/**
 * Creates a recursive schema.
 *
 * @param getter The schema getter.
 *
 * @returns A recursive schema.
 */
// @__NO_SIDE_EFFECTS__
export function recursiveAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
  getter: (self: RecursiveSelfSchemaAsync) => MaybePromise<TWrapped>
): RecursiveSchemaAsync<TWrapped> {
  return {
    kind: 'schema',
    type: 'recursive',
    reference: recursiveAsync,
    expects: 'unknown',
    async: true,
    getter,
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, config) {
      const outputDataset = await (
        await this.getter(this as unknown as RecursiveSelfSchemaAsync)
      )['~run'](dataset, config);
      return outputDataset as OutputDataset<
        ResolveRecursiveOutput<InferOutput<TWrapped>>,
        InferIssue<TWrapped>
      >;
    },
  };
}
