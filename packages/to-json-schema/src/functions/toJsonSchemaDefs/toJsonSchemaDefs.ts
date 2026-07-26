import type * as v from 'valibot';
import { convertSchema } from '../../converters/index.ts';
import type {
  ConversionConfig,
  ConversionContext,
  JsonSchema,
} from '../../types/index.ts';

/**
 * Converts Valibot schema definitions to JSON Schema definitions.
 *
 * @param definitions The Valibot schema definitions.
 * @param config The JSON Schema configuration.
 *
 * @returns The converted JSON Schema definitions.
 */
export function toJsonSchemaDefs<
  TDefinitions extends Record<
    string,
    v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
  >,
>(
  definitions: TDefinitions,
  config?: Omit<ConversionConfig, 'definitions'>
): { [TKey in keyof TDefinitions]: JsonSchema } {
  // Initialize JSON Schema context
  const context: ConversionContext = {
    definitions: {},
    referenceMap: new Map(),
    getterMap: new Map(),
  };

  // Add provided definitions to context, if necessary
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

  // Return JSON Schema definitions
  // @ts-expect-error
  return context.definitions;
}
