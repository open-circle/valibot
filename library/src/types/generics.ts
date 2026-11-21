/**
 * Generics registry interface.
 *
 * Each entry provides `getArgs` to extract the arguments of `T`, or `never`
 * when it does not match, and `applyArgs` to reconstruct it from `TArgs`.
 * Extend this interface through module augmentation to register a generic.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars -- Type parameters are used by module augmentations.
export interface Generics<T, TArgs> {}

/**
 * Generic constraint error interface.
 */
export interface GenericConstraintError<
  TError extends {
    readonly generic: PropertyKey;
    readonly received: unknown;
  },
> {
  /**
   * The generic name.
   */
  readonly generic: TError['generic'];
  /**
   * The resolved arguments.
   */
  readonly received: TError['received'];
}
