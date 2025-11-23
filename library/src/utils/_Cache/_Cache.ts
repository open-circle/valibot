import type { BaseCache } from '../../types/index.ts';

/**
 * Cache options.
 */
export interface CacheOptions {
  /**
   * The maximum number of items to cache.
   *
   * @default 1000
   */
  maxSize?: number;
  /**
   * The maximum age of a cache entry in milliseconds.
   *
   * @default undefined
   */
  duration?: number;
}

interface _CacheEntry<TValue> {
  value: TValue;
  lastAccess: number;
}

/**
 * A basic cache with optional max size and expiry.
 */
export class _Cache<TKey, TValue> implements BaseCache<TKey, TValue> {
  maxSize: number;
  duration: number | undefined;
  constructor(options?: CacheOptions) {
    this.maxSize = options?.maxSize ?? 1000;
    this.duration = options?.duration;
  }
  get size(): number {
    return this['~cache'].size;
  }
  get(key: TKey): TValue | undefined {
    return this['~get'](key)?.value;
  }
  set(key: TKey, value: TValue): this {
    this['~insert'](key, value);
    this['~clearExcess']();
    return this;
  }
  has(key: TKey): boolean {
    return !!this['~get'](key);
  }
  delete(key: TKey): boolean {
    return this['~cache'].delete(key);
  }
  clear(): void {
    this['~cache'].clear();
  }

  '~cache': Map<TKey, _CacheEntry<TValue>> = new Map<
    TKey,
    _CacheEntry<TValue>
  >();
  private '~isStale'(entry: _CacheEntry<TValue>): boolean {
    return !!this.duration && Date.now() - entry.lastAccess > this.duration;
  }
  private '~get'(key: TKey): _CacheEntry<TValue> | undefined {
    const entry = this['~cache'].get(key);
    if (!entry) return;
    if (this['~isStale'](entry)) {
      this['~cache'].delete(key);
      return;
    }
    // move to end
    this['~insert'](key, entry.value);
    return entry;
  }
  private '~insert'(key: TKey, value: TValue): void {
    // make sure this is always an insertion, not an update
    // important for map ordering
    this['~cache'].delete(key);
    this['~cache'].set(key, {
      value,
      lastAccess: Date.now(),
    });
  }
  private '~clearExcess'(): void {
    if (this.size <= this.maxSize) return;
    const keys = this['~cache'].keys();
    while (this.size > this.maxSize) {
      this['~cache'].delete(keys.next().value!);
    }
  }
}
