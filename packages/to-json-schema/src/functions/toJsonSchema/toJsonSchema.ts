import type * as v from 'valibot';
import { convertSchema } from '../../converters/index.ts';
import { getGlobalDefs } from '../../storages/index.ts';
import type {
  ConversionConfig,
  ConversionContext,
  JsonSchema,
} from '../../types/index.ts';

/**
 * Converts a Valibot schema to the JSON Schema format.
 *
 * @param schema The Valibot schema object.
 * @param config The JSON Schema configuration.
 *
 * @returns The converted JSON Schema.
 */
export function toJsonSchema(
  schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  config?: ConversionConfig
): JsonSchema {
  // Initialize JSON Schema context
  const context: ConversionContext = {
    definitions: {},
    referenceMap: new Map(),
    getterMap: new Map(),
  };

  // Get definitions from config or global storage
  const definitions = config?.definitions ?? getGlobalDefs();

  // Add provided definitions to context, if necessary
  if (definitions) {
    for (const key in definitions) {
      context.referenceMap.set(definitions[key], key);
    }
    for (const key in definitions) {
      context.definitions[key] = convertSchema(
        {},
        // @ts-expect-error
        definitions[key],
        config,
        context,
        true
      );
    }
  }

  // Convert Valibot schema to JSON Schema
  const jsonSchema = convertSchema(
    {},
    // @ts-expect-error
    schema,
    config,
    context
  );

  // Add schema URI to JSON Schema, if necessary
  // Hint: OpenAPI 3.0 has no `$schema` property
  const target = config?.target ?? 'draft-07';
  if (target === 'draft-2020-12') {
    jsonSchema.$schema = 'https://json-schema.org/draft/2020-12/schema';
  } else if (target === 'draft-07') {
    jsonSchema.$schema = 'http://json-schema.org/draft-07/schema#';
  }

  // Add definitions to JSON Schema, if necessary
  if (context.referenceMap.size) {
    jsonSchema.$defs = context.definitions;
  }

  // Return converted JSON Schema
  return jsonSchema;
}
