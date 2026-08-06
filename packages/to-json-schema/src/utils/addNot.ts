import type { JsonSchema } from '../types/index.ts';

/**
 * Adds a not constraint while preserving an existing one.
 *
 * @param jsonSchema The JSON Schema object.
 * @param not The JSON Schema not constraint.
 */
export function addNot(
  jsonSchema: JsonSchema,
  not: Exclude<JsonSchema['not'], undefined>
): void {
  const existingNot = jsonSchema.not;
  if (existingNot === undefined) {
    jsonSchema.not = not;
  } else {
    jsonSchema.allOf = [
      ...(jsonSchema.allOf ?? []),
      { not: existingNot },
      { not },
    ];
    delete jsonSchema.not;
  }
}
