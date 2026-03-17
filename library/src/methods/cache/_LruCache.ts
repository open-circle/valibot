import type { BaseIssue, Config } from '../../types/index.ts';
import type { Cache, CacheConfig } from './types.ts';

/**
 * Efficient LRU cache using Map iteration order.
 */
class _LruCache<TValue> implements Cache<TValue> {
  // Stores [value, timestamp] tuples to avoid object allocation overhead
  private store: Map<string, [TValue, number]> | undefined;

  // Assign stable IDs to references
  private refIds: WeakMap<WeakKey, number> | undefined;

  // Counter for tracking references
  private refCount = 0;

  // Cache configuration
  private readonly maxSize: number;
  private readonly maxAge: number;
  private readonly hasMaxAge: boolean;

  constructor(config?: CacheConfig) {
    this.maxSize = config?.maxSize ?? 1000;
    this.maxAge = config?.maxAge ?? Infinity;
    this.hasMaxAge = isFinite(this.maxAge);
  }

  /**
   * Stringifies an unknown input to a cache key component.
   *
   * @param input The unknown input.
   *
   * @returns A cache key component.
   */
  #stringify(input: unknown): string {
    const type = typeof input;
    if (type === 'string') {
      return `"${input}"`;
    }
    if (type === 'number' || type === 'boolean') {
      return `${input}`;
    }
    if (type === 'bigint') {
      return `${input}n`;
    }
    if (type === 'object' || type === 'function') {
      if (input) {
        this.refIds ??= new WeakMap();
        let id = this.refIds.get(input as WeakKey);
        if (!id) {
          id = ++this.refCount;
          this.refIds.set(input as WeakKey, id);
        }
        return `#${id}`;
      }
      return 'null';
    }
    return type;
  }

  /**
   * Creates a cache key from input and config.
   *
   * @param input The input value.
   * @param config The parse configuration.
   *
   * @returns The cache key.
   */
  key(input: unknown, config: Config<BaseIssue<unknown>> = {}): string {
    return `${this.#stringify(input)}|${this.#stringify(config.lang)}|${this.#stringify(
      config.message
    )}|${this.#stringify(config.abortEarly)}|${this.#stringify(
      config.abortPipeEarly
    )}`;
  }

  /**
   * Gets a value from the cache by key.
   *
   * @param key The cache key.
   *
   * @returns The cached value.
   */
  get(key: string): TValue | undefined {
    if (!this.store) return undefined;

    // Get entry tuple [value, timestamp]
    const entry = this.store.get(key);

    // Return undefined if not found
    if (!entry) return undefined;

    // Delete stale entry if maxAge is exceeded
    if (this.hasMaxAge && Date.now() - entry[1] > this.maxAge) {
      this.store.delete(key);
      return undefined;
    }

    // Reorder by deleting and re-inserting at end (most recently used)
    this.store.delete(key);
    this.store.set(key, entry);

    // Return cached value
    return entry[0];
  }

  /**
   * Sets a value in the cache by key.
   *
   * @param key The cache key.
   * @param value The cached value.
   */
  set(key: string, value: TValue): void {
    this.store ??= new Map();

    // Delete first to ensure insertion at end for correct ordering
    this.store.delete(key);

    // Set value with current timestamp if maxAge is used
    const timestamp = this.hasMaxAge ? Date.now() : 0;
    this.store.set(key, [value, timestamp]);

    // Evict oldest entry (first key) if over maxSize
    if (this.store.size > this.maxSize) {
      this.store.delete(this.store.keys().next().value!);
    }
  }

  /**
   * Clears all entries from the cache.
   */
  clear(): void {
    this.store?.clear();
  }
}

export { _LruCache };
