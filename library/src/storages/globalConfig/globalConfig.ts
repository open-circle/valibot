import type { BaseIssue, Config } from '../../types/index.ts';

/**
 * The global config type.
 */
export type GlobalConfig = Omit<Config<never>, 'message'>;

// Create global configuration store
let store: GlobalConfig | undefined;

// Shared default config returned when no local or global config is set
const DEFAULT_CONFIG: Config<never> = {
  lang: undefined,
  message: undefined,
  abortEarly: undefined,
  abortPipeEarly: undefined,
};

/**
 * Sets the global configuration.
 *
 * @param config The configuration.
 */
export function setGlobalConfig(config: GlobalConfig): void {
  store = { ...store, ...config };
}

/**
 * Returns the global configuration.
 *
 * @param config The config to merge.
 *
 * @returns The configuration.
 */
// @__NO_SIDE_EFFECTS__
export function getGlobalConfig<const TIssue extends BaseIssue<unknown>>(
  config?: Config<TIssue>
): Config<TIssue> {
  // Fast path: return shared default when no local or global config is set
  if (!config && !store) return DEFAULT_CONFIG as Config<TIssue>;
  // Hint: The configuration is deliberately not constructed with the spread
  // operator for performance reasons
  return {
    lang: config?.lang ?? store?.lang,
    message: config?.message,
    abortEarly: config?.abortEarly ?? store?.abortEarly,
    abortPipeEarly: config?.abortPipeEarly ?? store?.abortPipeEarly,
  };
}

/**
 * Deletes the global configuration.
 */
export function deleteGlobalConfig(): void {
  store = undefined;
}
