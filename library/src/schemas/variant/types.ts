import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
  InferIssue,
  MaybeReadonly,
  ObjectEntries,
  ObjectEntriesAsync,
  OptionalEntrySchema,
  OptionalEntrySchemaAsync,
} from '../../types/index.ts';
import type { variant } from './variant.ts';
import type { variantAsync } from './variantAsync.ts';

/**
 * Variant issue interface.
 */
export interface VariantIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'variant';
  /**
   * The expected property.
   */
  readonly expected: string;
}

/**
 * Variant option schema interface.
 */
export interface VariantOptionSchema<TKey extends string>
  extends BaseSchema<unknown, unknown, VariantIssue | BaseIssue<unknown>> {
  readonly type: 'variant';
  readonly reference: typeof variant;
  readonly key: string;
  readonly options: VariantOptions<TKey>;
  readonly message: ErrorMessage<VariantIssue> | undefined;
}

/**
 * Variant option schema async interface.
 */
export interface VariantOptionSchemaAsync<TKey extends string>
  extends BaseSchemaAsync<unknown, unknown, VariantIssue | BaseIssue<unknown>> {
  readonly type: 'variant';
  readonly reference: typeof variant | typeof variantAsync;
  readonly key: string;
  readonly options: VariantOptionsAsync<TKey>;
  readonly message: ErrorMessage<VariantIssue> | undefined;
}

/**
 * Variant object entries type.
 */
type VariantObjectEntries<TKey extends string> = Record<
  TKey,
  BaseSchema<unknown, unknown, BaseIssue<unknown>> | OptionalEntrySchema
> &
  ObjectEntries;

/**
 * Variant object entries async type.
 */
type VariantObjectEntriesAsync<TKey extends string> = Record<
  TKey,
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
  | OptionalEntrySchema
  | OptionalEntrySchemaAsync
> &
  ObjectEntriesAsync;

/**
 * Variant object option interface.
 *
 * Hint: We use a structural interface instead of the object schema interfaces,
 * because relating an object schema to another instantiation of the same
 * interface forces TypeScript to measure its variance, which is expensive
 * (see issue #1663).
 */
interface VariantObjectOption<TKey extends string>
  extends BaseSchema<unknown, unknown, BaseIssue<unknown>> {
  /**
   * The schema type.
   */
  readonly type:
    | 'loose_object'
    | 'object'
    | 'object_with_rest'
    | 'strict_object';
  /**
   * The entries schema.
   */
  readonly entries: VariantObjectEntries<TKey>;
}

/**
 * Variant object option async interface.
 *
 * Hint: We use a structural interface instead of the object schema interfaces,
 * because relating an object schema to another instantiation of the same
 * interface forces TypeScript to measure its variance, which is expensive
 * (see issue #1663).
 */
interface VariantObjectOptionAsync<TKey extends string>
  extends BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> {
  /**
   * The schema type.
   */
  readonly type:
    | 'loose_object'
    | 'object'
    | 'object_with_rest'
    | 'strict_object';
  /**
   * The entries schema.
   */
  readonly entries: VariantObjectEntriesAsync<TKey>;
}

/**
 * Variant option type.
 */
type VariantOption<TKey extends string> =
  | VariantObjectOption<TKey>
  | VariantOptionSchema<TKey>;

/**
 * Variant option async type.
 */
type VariantOptionAsync<TKey extends string> =
  | VariantObjectOptionAsync<TKey>
  | VariantOptionSchemaAsync<TKey>;

/**
 * Variant options type.
 */
export type VariantOptions<TKey extends string> = MaybeReadonly<
  VariantOption<TKey>[]
>;

/**
 * Variant options async type.
 */
export type VariantOptionsAsync<TKey extends string> = MaybeReadonly<
  (VariantOption<TKey> | VariantOptionAsync<TKey>)[]
>;

/**
 * Infer variant issue type.
 */
export type InferVariantIssue<
  TOptions extends VariantOptions<string> | VariantOptionsAsync<string>,
> = Exclude<
  InferIssue<TOptions[number]>,
  { type: 'loose_object' | 'object' | 'object_with_rest' }
>;
