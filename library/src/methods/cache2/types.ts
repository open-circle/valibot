/**
 * Cache2 interface type.
 */
export interface Cache2<TValue> {
  /**
   * Gets a value from the cache by key.
   */
  get(key: unknown): TValue | undefined;
  /**
   * Sets a value in the cache by key.
   */
  set(key: unknown, value: TValue): void;
  /**
   * Clears all entries from the cache.
   */
  clear(): void;
}

/**
 * Cache2 config type.
 */
export interface CacheConfig2 {
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
