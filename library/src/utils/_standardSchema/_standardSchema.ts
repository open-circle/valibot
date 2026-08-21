import { getGlobalConfig } from '../../storages/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
} from '../../types/index.ts';

/**
 * Eagerly creates and attaches the Standard Schema properties of a schema.
 *
 * @param schema The schema without standard properties.
 *
 * @returns The schema with standard properties attached.
 *
 * @internal
 */
export function _standardSchema<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: Omit<TSchema, '~standard'>): TSchema {
  // @ts-expect-error
  schema['~standard'] = {
    version: 1,
    vendor: 'valibot',
    validate: (value: unknown) => schema['~run']({ value }, getGlobalConfig()),
  };
  return schema as TSchema;
}
