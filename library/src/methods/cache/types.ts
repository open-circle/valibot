import type { BaseIssue, Config } from '../../types/index.ts';

/**
 * Cache interface type.
 *
 * @beta
 */
export interface Cache<TValue> {
  /**
   * Creates a cache key from input and config.
   *
   * Hint: Primitive inputs are keyed by value. Object and function inputs are
   * keyed by reference identity.
   */
  key(input: unknown, config?: Config<BaseIssue<unknown>>): string;
  /**
   * Gets a value from the cache by key.
   */
  get(key: string): TValue | undefined;
  /**
   * Sets a value in the cache by key.
   */
  set(key: string, value: TValue): void;
  /**
   * Clears all entries from the cache.
   */
  clear(): void;
}

/**
 * Cache config type.
 *
 * @beta
 */
export interface CacheConfig {
  /**
   * The maximum number of items to cache.
   *
   * @default 1000
   */
  maxSize?: number;
  /**
   * The maximum age of a cache entry in milliseconds.
   *
   * @default Infinity
   */
  maxAge?: number;
}
