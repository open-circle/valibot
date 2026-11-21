import type * as v from 'valibot';
import { convertSchema } from '../../converters/index.ts';
import type {
  ConversionConfig,
  ConversionContext,
  JsonSchema,
} from '../../types/index.ts';
import { ReferenceMap } from '../../utils/index.ts';

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
    referenceMap: new ReferenceMap(),
    getterMap: new Map(),
  };

  // Add provided definitions to context, if necessary
  for (const key in definitions) {
    const definition = definitions[key];
    context.referenceMap.set(definition, key);
    if (
      definition.type === 'recursive' ||
      definition.type === 'mutualRecursive'
    ) {
      context.referenceMap.set(
        (definition as v.RecursiveSchema | v.MutualRecursiveSchema).wrapped,
        key
      );
    }
  }
  for (const key in definitions) {
    Object.defineProperty(context.definitions, key, {
      value: convertSchema(
        {},
        // @ts-expect-error
        definitions[key],
        config,
        context,
        true
      ),
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }

  // Return JSON Schema definitions
  // @ts-expect-error
  return context.definitions;
}
