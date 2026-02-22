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
import { getFallback } from '../getFallback/index.ts';
import type { InferFallbacks } from './types.ts';

/**
 * Returns the fallback values of the schema.
 *
 * Hint: The difference to `getFallback` is that for object and tuple schemas
 * this function recursively returns the fallback values of the subschemas
 * instead of `undefined`.
 *
 * @param schema The schema to get them from.
 *
 * @returns The fallback values.
 */
// @__NO_SIDE_EFFECTS__
export function getFallbacks<
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
>(schema: TSchema): InferFallbacks<TSchema> {
  
  // If it has a fallback, return it.
  if ('fallback' in schema) {
    return schema.fallback as InferFallbacks<TSchema>;
  }

  // If it is an object schema, return fallbacks of entries
  if ('entries' in schema) {
    const object: Record<string, unknown> = {};
    for (const key in schema.entries) {
      object[key] = getFallbacks(schema.entries[key]);
    }
    return object as InferFallbacks<TSchema>;
  }

  // If it is a tuple schema, return fallbacks of items
  if ('items' in schema) {
    return schema.items.map(getFallbacks) as InferFallbacks<TSchema>;
  }

  // Otherwise, return fallback or `undefined`
  // @ts-expect-error
  return getFallback(schema);
}
