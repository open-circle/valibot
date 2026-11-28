import type { JsonSchema } from '../types/index.ts';

/**
 * Defines a schema property without invoking inherited setters.
 *
 * @param target The schema dictionary.
 * @param key The property key.
 * @param value The schema definition.
 */
export function setSchemaProperty(
  target: Record<string, JsonSchema | boolean>,
  key: string,
  value: JsonSchema | boolean
): void {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
}
