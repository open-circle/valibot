/**
 * Checks if a type is `any`.
 */
export type IsAny<Type> = 0 extends 1 & Type ? true : false;

/**
 * Checks if a type is `never`.
 */
export type IsNever<Type> = [Type] extends [never] ? true : false;

/**
 * Extracts `null` from a type.
 */
export type NonNullable<TValue> = TValue extends null ? never : TValue;

/**
 * Extracts `null` and `undefined` from a type.
 */
export type NonNullish<TValue> = TValue extends null | undefined
  ? never
  : TValue;

/**
 * Extracts `undefined` from a type.
 */
export type NonOptional<TValue> = TValue extends undefined ? never : TValue;

/**
 * Constructs a type that is maybe readonly.
 */
export type MaybeReadonly<TValue> = TValue | Readonly<TValue>;

/**
 * Constructs a type that is maybe a promise.
 */
export type MaybePromise<TValue> = TValue | Promise<TValue>;

/**
 * Prettifies a type for better readability.
 *
 * Hint: This type has no effect and is only used so that TypeScript displays
 * the final type in the preview instead of the utility types used.
 */
export type Prettify<TObject> = { [TKey in keyof TObject]: TObject[TKey] } & {};

/**
 * Marks specific keys as optional.
 */
export type MarkOptional<TObject, TKeys extends keyof TObject> =
  // Mapping any entry to unknown preserves key order in final output
  { [TKey in keyof TObject]?: unknown } & Omit<TObject, TKeys> &
    Partial<Pick<TObject, TKeys>>;

/**
 * Merges two objects. Overlapping entries from the second object overwrite
 * properties from the first object.
 */
export type Merge<TFirstObject, TSecondObject> = Omit<
  TFirstObject,
  keyof TFirstObject & keyof TSecondObject
> &
  TSecondObject;

/**
 * Extracts first tuple item.
 */
export type FirstTupleItem<TTuple extends readonly [unknown, ...unknown[]]> =
  TTuple[0];

/**
 * Extracts last tuple item.
 */
export type LastTupleItem<TTuple extends readonly [unknown, ...unknown[]]> =
  TTuple[TTuple extends readonly [unknown, ...infer TRest]
    ? TRest['length']
    : never];

/**
 * Converts union to intersection type.
 */
export type UnionToIntersect<TUnion> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (TUnion extends any ? (arg: TUnion) => void : never) extends (
    arg: infer Intersect
  ) => void
    ? Intersect
    : never;

/**
 * Converts union to tuple type using an accumulator.
 *
 * For more information: {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types}
 */
type UnionToTupleHelper<TUnion, TResult extends unknown[]> =
  UnionToIntersect<
    TUnion extends never ? never : () => TUnion
  > extends () => infer TLast
    ? UnionToTupleHelper<Exclude<TUnion, TLast>, [TLast, ...TResult]>
    : TResult;

/**
 * Converts union to tuple type.
 */
export type UnionToTuple<TUnion> = UnionToTupleHelper<TUnion, []>;

export type IfMaybeUndefined<T, True, False> = [undefined] extends [T]
  ? True
  : False;
