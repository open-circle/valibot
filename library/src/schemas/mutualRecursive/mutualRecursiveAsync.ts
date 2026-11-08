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
  createRefFactory,
  OwnerSymbol,
  type RecursiveMarker,
  type RecursiveOwner,
  type RecursiveReferences,
  type RefFactoryAsync,
  type ResolveRecursiveInput,
  type ResolveRecursiveOutput,
} from './mutualRecursive.ts';

/**
 * Mutual recursive schema async interface.
 */
export interface MutualRecursiveSchemaAsync<
  TWrapped extends SyncOrAsyncSchema = SyncOrAsyncSchema,
  TInput = unknown,
  TOutput = unknown,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseSchemaAsync<TInput, TOutput, TIssue> {
  /**
   * The schema type.
   */
  readonly type: 'mutualRecursiveAsync';
  /**
   * The schema reference.
   */
  readonly reference: typeof createRecursiveSchema;
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
type Entries = Record<string, SyncOrAsyncSchema>;

type DefinitionInputs<TEntries extends Entries> = {
  [TKey in keyof TEntries]: InferInput<TEntries[TKey]>;
};
type DefinitionOutputs<TEntries extends Entries> = {
  [TKey in keyof TEntries]: InferOutput<TEntries[TKey]>;
};

interface Error<TReason extends string> {
  readonly reason: TReason;
  readonly impossible: never;
}

type ReferenceNames<TReference> =
  TReference extends RecursiveMarker<infer TName> ? TName : never;

type UnmatchedReferences<TEntries extends Entries> = Exclude<
  ReferenceNames<
    RecursiveReferences<
      DefinitionInputs<TEntries> | DefinitionOutputs<TEntries>
    >
  >,
  keyof TEntries
>;
type CheckReferences<TEntries extends Entries> = [
  UnmatchedReferences<TEntries>,
] extends [never]
  ? unknown
  : Error<`Unmatched recursive reference: '${Extract<UnmatchedReferences<TEntries>, string>}'`>;

/**
 * Resolved mutual recursive schema async interface.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- A named interface defers recursive type resolution.
export interface ResolvedRecursiveSchemaAsync<
  TWrapped extends SyncOrAsyncSchema,
  TInputRoot,
  TOutputRoot,
  TIssue extends BaseIssue<unknown>,
> extends MutualRecursiveSchemaAsync<
    TWrapped,
    ResolveRecursiveInput<InferInput<TWrapped>, TInputRoot>,
    ResolveRecursiveOutput<InferOutput<TWrapped>, TOutputRoot>,
    TIssue
  > {}

type RecursiveSchemas<TEntries extends Entries> = {
  [TName in keyof TEntries]: ResolvedRecursiveSchemaAsync<
    TEntries[TName],
    DefinitionInputs<TEntries>,
    DefinitionOutputs<TEntries>,
    InferIssue<TEntries[keyof TEntries]>
  >;
};

/**
 * Creates a map of mutually recursive async schemas.
 *
 * @param build The callback that builds the schema entries. It runs once during construction.
 *
 * @returns A map of recursive async schemas.
 */
export function mutualRecursiveAsync<const TEntries extends Entries>(
  build: (ref: RefFactoryAsync) => TEntries & CheckReferences<TEntries>
): RecursiveSchemas<TEntries>;
export function mutualRecursiveAsync(
  build: (ref: RefFactoryAsync) => Entries
): unknown {
  const owner = {
    async: true,
    reference: createRecursiveSchema,
    get definition(): Entries {
      return definitions;
    },
  } satisfies RecursiveOwner;
  const definitions = build(createRefFactory(owner));
  const seen = new Set<object>();
  const entries: Record<string, MutualRecursiveSchemaAsync> =
    Object.create(null);
  for (const key of Object.keys(definitions)) {
    checkRecursiveReferences(definitions[key], owner, seen);
    entries[key] = createRecursiveSchema(definitions[key], owner);
  }
  return entries;
}

function createRecursiveSchema(
  root: SyncOrAsyncSchema,
  owner: RecursiveOwner
): MutualRecursiveSchemaAsync {
  return _standardSchema<MutualRecursiveSchemaAsync>({
    kind: 'schema',
    type: 'mutualRecursiveAsync',
    reference: createRecursiveSchema,
    expects: 'unknown',
    async: true,
    wrapped: root,
    async '~run'(dataset, config) {
      const executionConfig: ConfigWithOwner = {
        ...config,
        [OwnerSymbol]: owner,
      };
      return root['~run'](dataset, executionConfig);
    },
  });
}
