import type {
  BaseIssue,
  GenericSchema,
  GenericSchemaAsync,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import {
  checkRecursiveReferences,
  createRecursiveSchema,
  createRef,
  type RecursiveMarker,
  type RecursiveOwner,
  type RecursiveReferences,
  type Ref,
  type RefAsync,
  type ResolveRecursiveInput,
  type ResolveRecursiveIssue,
  type ResolveRecursiveOutput,
} from '../recursive/_recursive.ts';
import type { MutualRecursiveSchema } from './mutualRecursive.ts';
import type { MutualRecursiveSchemaAsync } from './mutualRecursiveAsync.ts';

/**
 * Factory for named synchronous recursive references.
 */
export type RefFactory = <const TName extends string = never>(
  name: TName
) => Ref<TName>;

/**
 * Factory for named async recursive references.
 */
export type RefFactoryAsync = <const TName extends string = never>(
  name: TName
) => RefAsync<TName>;

/**
 * Creates a factory for named synchronous recursive references.
 *
 * @param owner The owner of the references.
 *
 * @returns A named reference factory.
 *
 * @internal
 */
export function createRefFactory(
  owner: RecursiveOwner & { readonly async: false }
): RefFactory;

/**
 * Creates a factory for named async recursive references.
 *
 * @param owner The owner of the references.
 *
 * @returns A named async reference factory.
 *
 * @internal
 */
export function createRefFactory(
  owner: RecursiveOwner & { readonly async: true }
): RefFactoryAsync;
export function createRefFactory(owner: RecursiveOwner) {
  return <const TName extends string = never>(name: TName) =>
    createRef(owner, name);
}

type SyncOrAsyncSchema = GenericSchema | GenericSchemaAsync;
type Entries = Record<string, SyncOrAsyncSchema>;

/**
 * Mutual recursive construction options.
 *
 * @internal
 */
export type MutualConstruction = {
  readonly reference: RecursiveOwner['reference'];
} & (
  | {
      readonly type: 'mutualRecursive';
      readonly async: false;
      readonly build: (ref: RefFactory) => Record<string, GenericSchema>;
    }
  | {
      readonly type: 'mutualRecursiveAsync';
      readonly async: true;
      readonly build: (ref: RefFactoryAsync) => Entries;
    }
);

/**
 * Creates the entries for a mutually recursive schema group.
 *
 * @param owner The recursive owner and construction options.
 * @param setEntries The function that installs the entries.
 *
 * @returns A map of recursive schemas.
 *
 * @internal
 */
export function createMutualRecursive(
  owner: MutualConstruction & RecursiveOwner,
  setEntries: (entries: Entries) => void
): Record<string, Entries[string]> {
  // @ts-expect-error TS can't correlate the owner's sync/async build callback with its matching reference factory.
  const entries = owner.build(createRefFactory(owner));
  setEntries(entries);
  const seen = new Set<object>();
  const schemas: Record<PropertyKey, Entries[string]> = Object.create(null);
  for (const key of Reflect.ownKeys(entries)) {
    const entry = (entries as Record<PropertyKey, Entries[string]>)[key];
    checkRecursiveReferences(entry, owner, seen);
    schemas[key] = createRecursiveSchema<
      Entries[string] & { readonly wrapped: Entries[string] }
    >(entry, owner, owner.type, owner.reference);
  }
  return schemas;
}

type EntryInputs<TEntries extends Entries> = {
  [TKey in keyof TEntries as `${TKey & (string | number)}`]: InferInput<
    TEntries[TKey]
  >;
};
type EntryOutputs<TEntries extends Entries> = {
  [TKey in keyof TEntries as `${TKey & (string | number)}`]: InferOutput<
    TEntries[TKey]
  >;
};

type ReferenceNames<TReference> =
  TReference extends RecursiveMarker<infer TName> ? TName : never;

type UnmatchedReferences<TEntries extends Entries> = Exclude<
  ReferenceNames<
    RecursiveReferences<EntryInputs<TEntries> | EntryOutputs<TEntries>>
  >,
  keyof EntryInputs<TEntries>
>;

interface Error<TReason extends string> {
  readonly reason: TReason;
  readonly impossible: never;
}

/**
 * Rejects references to names absent from the entries.
 *
 * @internal
 */
export type CheckReferences<TEntries extends Entries> = [
  UnmatchedReferences<TEntries>,
] extends [never]
  ? unknown
  : Error<`Unmatched recursive reference: '${Extract<UnmatchedReferences<TEntries>, string>}'`>;

/**
 * Resolved mutual recursive schema interface.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- A named interface defers recursive type resolution.
export interface ResolvedRecursiveSchema<
  TWrapped extends GenericSchema,
  TInputRoot,
  TOutputRoot,
  TIssue extends BaseIssue<unknown>,
> extends MutualRecursiveSchema<
    TWrapped,
    ResolveRecursiveInput<InferInput<TWrapped>, TInputRoot>,
    ResolveRecursiveOutput<InferOutput<TWrapped>, TOutputRoot>,
    ResolveRecursiveIssue<TIssue>
  > {}

/**
 * Resolved mutual recursive schema async interface.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- A named interface defers recursive type resolution.
export interface ResolvedRecursiveSchemaAsync<
  TWrapped extends Entries[string],
  TInputRoot,
  TOutputRoot,
  TIssue extends BaseIssue<unknown>,
> extends MutualRecursiveSchemaAsync<
    TWrapped,
    ResolveRecursiveInput<InferInput<TWrapped>, TInputRoot>,
    ResolveRecursiveOutput<InferOutput<TWrapped>, TOutputRoot>,
    ResolveRecursiveIssue<TIssue>
  > {}

/**
 * Resolves each synchronous entry against the complete entries map.
 *
 * @internal
 */
export type RecursiveSchemas<TEntries extends Record<string, GenericSchema>> = {
  [TName in keyof TEntries]: ResolvedRecursiveSchema<
    TEntries[TName],
    EntryInputs<TEntries>,
    EntryOutputs<TEntries>,
    InferIssue<TEntries[keyof TEntries]>
  >;
};

/**
 * Resolves each async entry against the complete entries map.
 *
 * @internal
 */
export type RecursiveSchemasAsync<TEntries extends Entries> = {
  [TName in keyof TEntries]: ResolvedRecursiveSchemaAsync<
    TEntries[TName],
    EntryInputs<TEntries>,
    EntryOutputs<TEntries>,
    InferIssue<TEntries[keyof TEntries]>
  >;
};
