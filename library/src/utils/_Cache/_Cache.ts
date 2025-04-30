import type { BaseCache } from '../../types/index.ts';

/**
 * Cache options.
 */
export interface CacheOptions {
  maxSize?: number;
  duration?: number;
}

interface _CacheEntry<TValue> {
  value: TValue;
  expiryId: ReturnType<typeof setTimeout> | undefined;
}

/**
 * A basic cache with optional max size and expiry.
 */
export class _Cache<TKey, TValue> implements BaseCache<TKey, TValue> {
  private maxSize: number;
  private duration: number | undefined;
  private cache = new Map<TKey, _CacheEntry<TValue>>();
  constructor(options?: CacheOptions) {
    this.maxSize = options?.maxSize ?? 1;
    this.duration = options?.duration;
  }
  private scheduleExpiry(key: TKey) {
    if (!this.duration) return;
    return setTimeout(() => this.cache.delete(key), this.duration);
  }
  get(key: TKey): TValue | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      // reset expiry
      clearTimeout(entry.expiryId);
      entry.expiryId = this.scheduleExpiry(key);
      return entry.value;
    }
  }
  set(key: TKey, value: TValue): void {
    if (this.cache.size >= this.maxSize) {
      this.delete(this.cache.keys().next().value!);
    }
    clearTimeout(this.cache.get(key)?.expiryId);
    this.cache.set(key, {
      value,
      expiryId: this.scheduleExpiry(key),
    });
  }
  has(key: TKey): boolean {
    return this.cache.has(key);
  }
  delete(key: TKey): boolean {
    clearTimeout(this.cache.get(key)?.expiryId);
    return this.cache.delete(key);
  }
  clear(): void {
    this.cache.forEach((entry) => clearTimeout(entry.expiryId));
    this.cache.clear();
  }
}
