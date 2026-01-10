import {
  type LooseObjectIssue,
  type LooseObjectSchema,
  type LooseObjectSchemaAsync,
  type ObjectIssue,
  type ObjectSchema,
  type ObjectSchemaAsync,
  type ObjectWithRestIssue,
  type ObjectWithRestSchema,
  type ObjectWithRestSchemaAsync,
  picklist,
  type PicklistIssue,
  type PicklistSchema,
  type StrictObjectIssue,
  type StrictObjectSchema,
  type StrictObjectSchemaAsync,
} from '../../schemas/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  ObjectEntries,
  ObjectEntriesAsync,
  UnionToTuple,
} from '../../types/index.ts';

export namespace keyof_ {
  /**
   * Schema type.
   */
  export type Schema =
    | LooseObjectSchema<
        ObjectEntries,
        ErrorMessage<LooseObjectIssue> | undefined
      >
    | LooseObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<LooseObjectIssue> | undefined
      >
    | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>
    | ObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<ObjectIssue> | undefined
      >
    | ObjectWithRestSchema<
        ObjectEntries,
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<ObjectWithRestIssue> | undefined
      >
    | ObjectWithRestSchemaAsync<
        ObjectEntriesAsync,
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<ObjectWithRestIssue> | undefined
      >
    | StrictObjectSchema<
        ObjectEntries,
        ErrorMessage<StrictObjectIssue> | undefined
      >
    | StrictObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<StrictObjectIssue> | undefined
      >;
}

/**
 * Force tuple type.
 */
type ForceTuple<T> = T extends [string, ...string[]] ? T : [];

/**
 * Object keys type.
 */
type ObjectKeys<TSchema extends keyof_.Schema> = ForceTuple<
  UnionToTuple<keyof TSchema['entries']>
>;

/**
 * Creates a picklist schema of object keys.
 *
 * @param schema The object schema.
 *
 * @returns A picklist schema.
 */
export function keyof_<const TSchema extends keyof_.Schema>(
  schema: TSchema
): PicklistSchema<ObjectKeys<TSchema>, undefined>;

/**
 * Creates a picklist schema of object keys.
 *
 * @param schema The object schema.
 * @param message The error message.
 *
 * @returns A picklist schema.
 */
export function keyof_<
  const TSchema extends keyof_.Schema,
  const TMessage extends ErrorMessage<PicklistIssue> | undefined,
>(
  schema: TSchema,
  message: TMessage
): PicklistSchema<ObjectKeys<TSchema>, TMessage>;

// @__NO_SIDE_EFFECTS__
export function keyof_(
  schema: keyof_.Schema,
  message?: ErrorMessage<PicklistIssue>
): PicklistSchema<
  ObjectKeys<keyof_.Schema>,
  ErrorMessage<PicklistIssue> | undefined
> {
  return picklist(
    Object.keys(schema.entries) as ObjectKeys<keyof_.Schema>,
    message
  );
}

export { keyof_ as keyof };
