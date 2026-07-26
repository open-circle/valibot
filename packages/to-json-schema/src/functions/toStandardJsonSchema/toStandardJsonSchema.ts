import type * as v from 'valibot';
import type { StandardJsonSchema } from '../../types/index.ts';
import { toJsonSchema } from '../toJsonSchema/index.ts';

type Target = 'draft-07' | 'draft-2020-12' | 'openapi-3.0';
const SUPPORTED_TARGETS = ['draft-07', 'draft-2020-12', 'openapi-3.0'];

/**
 * Converts a Valibot schema to the Standard JSON Schema format.
 *
 * @param schema The Valibot schema object.
 *
 * @returns The Standard JSON Schema.
 */
export function toStandardJsonSchema<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema
): StandardJsonSchema<v.InferInput<TSchema>, v.InferOutput<TSchema>> {
  return {
    '~standard': {
      ...schema['~standard'],
      jsonSchema: {
        input(options) {
          if (SUPPORTED_TARGETS.includes(options.target)) {
            return toJsonSchema(schema, {
              typeMode: 'input',
              target: options.target as Target,
              ...options.libraryOptions,
            }) as Record<string, unknown>;
          }
          throw new Error(`Unsupported target: ${options.target}`);
        },
        output(options) {
          if (SUPPORTED_TARGETS.includes(options.target)) {
            return toJsonSchema(schema, {
              typeMode: 'output',
              target: options.target as Target,
              ...options.libraryOptions,
            }) as Record<string, unknown>;
          }
          throw new Error(`Unsupported target: ${options.target}`);
        },
      },
    },
  };
}
