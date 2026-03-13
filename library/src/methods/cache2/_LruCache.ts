import type { Cache2, CacheConfig2 } from './types.ts';

/**
 * Efficient LRU cache using Map iteration order.
 */
class _LruCache<TValue> implements Cache2<TValue> {
  // Stores [value, timestamp] tuples to avoid object allocation overhead
  private readonly store = new Map<unknown, [TValue, number]>();

  // Cache configuration
  private readonly maxSize: number;
  private readonly maxAge: number;
  private readonly hasMaxAge: boolean;

  constructor(config?: CacheConfig2) {
    this.maxSize = config?.maxSize ?? 1000;
    this.maxAge = config?.maxAge ?? Infinity;
    this.hasMaxAge = isFinite(this.maxAge);
  }

  get(key: unknown): TValue | undefined {
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

  set(key: unknown, value: TValue): void {
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

  clear(): void {
    this.store.clear();
  }
}

export { _LruCache };
