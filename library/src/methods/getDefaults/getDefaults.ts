import type {
  LooseObjectIssue,
  LooseObjectSchema,
  LooseTupleIssue,
  LooseTupleSchema,
  ObjectIssue,
  ObjectSchema,
  ObjectWithRestIssue,
  ObjectWithRestSchema,
  StrictObjectIssue,
  StrictObjectSchema,
  StrictTupleIssue,
  StrictTupleSchema,
  TupleIssue,
  TupleSchema,
  TupleWithRestIssue,
  TupleWithRestSchema,
} from '../../schemas/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  ObjectEntries,
  TupleItems,
} from '../../types/index.ts';
import { getDefault } from '../getDefault/index.ts';
import type { InferDefaults } from './types.ts';

/**
 * Returns the default values of the schema.
 *
 * Hint: The difference to `getDefault` is that for object and tuple schemas
 * this function recursively returns the default values of the subschemas
 * instead of `undefined`.
 *
 * @param schema The schema to get them from.
 *
 * @returns The default values.
 */
// @__NO_SIDE_EFFECTS__
export function getDefaults<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | LooseObjectSchema<
        ObjectEntries,
        ErrorMessage<LooseObjectIssue> | undefined
      >
    | LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined>
    | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>
    | ObjectWithRestSchema<
        ObjectEntries,
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<ObjectWithRestIssue> | undefined
      >
    | StrictObjectSchema<
        ObjectEntries,
        ErrorMessage<StrictObjectIssue> | undefined
      >
    | StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined>
    | TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined>
    | TupleWithRestSchema<
        TupleItems,
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<TupleWithRestIssue> | undefined
      >,
>(schema: TSchema): InferDefaults<TSchema> {
  // If it is an object schema, return defaults of entries
  if ('entries' in schema) {
    const object: Record<string, unknown> = {};
    for (const key in schema.entries) {
      Object.defineProperty(object, key, {
        value: getDefaults(schema.entries[key]),
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
    return object as InferDefaults<TSchema>;
  }

  // If it is a tuple schema, return defaults of items
  if ('items' in schema) {
    return schema.items.map(getDefaults) as InferDefaults<TSchema>;
  }

  // Otherwise, return default or `undefined`
  // @ts-expect-error
  return getDefault(schema);
}
