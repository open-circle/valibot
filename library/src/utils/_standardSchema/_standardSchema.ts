import { getGlobalConfig } from '../../storages/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
} from '../../types/index.ts';

/**
 * Eagerly creates and attaches the Standard Schema properties of a schema.
 *
 * Hint: The contextual `this` type includes the standard properties that are
 * attached before the schema is returned.
 *
 * @param schema The schema to attach standard properties to.
 *
 * @returns The schema with standard properties attached.
 *
 * @internal
 */
export function _standardSchema<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: Omit<TSchema, '~standard'> & ThisType<TSchema>): TSchema {
  // @ts-expect-error
  schema['~standard'] = {
    version: 1,
    vendor: 'valibot',
    validate: (value: unknown) => schema['~run']({ value }, getGlobalConfig()),
  };
  return schema as TSchema;
}
