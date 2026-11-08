import type {
  BaseIssue,
  BaseSchemaAsync,
  GenericSchema,
  GenericSchemaAsync,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';
import {
  checkRecursiveReferences,
  type ConfigWithOwner,
  createRef,
  OwnerSymbol,
  type RecursiveOwner,
  type RefAsync,
  type ResolveRecursiveInput,
  type ResolveRecursiveOutput,
} from './recursive.ts';

/**
 * Recursive schema async interface.
 */
export interface RecursiveSchemaAsync<
  TWrapped extends SyncOrAsyncSchema = SyncOrAsyncSchema,
  TInput = unknown,
  TOutput = unknown,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseSchemaAsync<TInput, TOutput, TIssue> {
  /**
   * The schema type.
   */
  readonly type: 'recursiveAsync';
  /**
   * The schema reference.
   */
  readonly reference: typeof recursiveAsync<SyncOrAsyncSchema>;
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The wrapped schema.
   */
  readonly wrapped: TWrapped;
}

type SyncOrAsyncSchema = GenericSchema | GenericSchemaAsync;
/**
 * Resolved recursive schema async interface.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- A named interface defers recursive type resolution.
export interface ResolvedRecursiveSchemaAsync<
  TWrapped extends SyncOrAsyncSchema,
  TInputRoot = InferInput<TWrapped>,
  TOutputRoot = InferOutput<TWrapped>,
  TIssue extends BaseIssue<unknown> = InferIssue<TWrapped>,
> extends RecursiveSchemaAsync<
    TWrapped,
    ResolveRecursiveInput<InferInput<TWrapped>, TInputRoot>,
    ResolveRecursiveOutput<InferOutput<TWrapped>, TOutputRoot>,
    TIssue
  > {}

/**
 * Creates a recursive schema.
 *
 * @param definition The schema definition. It runs once during construction.
 *
 * @returns A recursive schema.
 */
export function recursiveAsync<const TWrapped extends SyncOrAsyncSchema>(
  definition: (self: RefAsync) => TWrapped
): ResolvedRecursiveSchemaAsync<TWrapped>;
export function recursiveAsync(
  definition: (self: RefAsync) => SyncOrAsyncSchema
): unknown {
  const owner = {
    async: true,
    reference: recursiveAsync<SyncOrAsyncSchema>,
    get definition() {
      return wrapped;
    },
  } satisfies RecursiveOwner;
  const wrapped = definition(createRef(owner));
  checkRecursiveReferences(wrapped, owner);
  return _standardSchema<RecursiveSchemaAsync>({
    kind: 'schema',
    type: 'recursiveAsync',
    reference: recursiveAsync<SyncOrAsyncSchema>,
    expects: 'unknown',
    async: true,
    wrapped,
    async '~run'(dataset, config) {
      const configWithOwner: ConfigWithOwner = {
        ...config,
        [OwnerSymbol]: owner,
      };
      return wrapped['~run'](dataset, configWithOwner);
    },
  });
}
