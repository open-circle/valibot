import type * as v from 'valibot';

// Create global definitions store
let store:
  | Record<string, v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>
  | undefined;

/**
 * Adds new definitions to the global schema definitions.
 *
 * @param definitions The schema definitions.
 *
 * @beta
 */
export function addGlobalDefs(
  definitions: Record<
    string,
    v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
  >
): void {
  store = { ...(store ?? {}), ...definitions };
}

/**
 * Returns the current global schema definitions.
 *
 * @returns The schema definitions.
 *
 * @beta
 */
export function getGlobalDefs():
  | Record<string, v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>
  | undefined {
  return store;
}
