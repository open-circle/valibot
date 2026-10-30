/**
 * Base metadata interface.
 */
export interface BaseMetadata<TInput> {
  /**
   * The object kind.
   */
  readonly kind: 'metadata';
  /**
   * The metadata type.
   */
  readonly type: string;
  /**
   * The metadata reference.
   */
  readonly reference: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => unknown;
  /**
   * The input, output and issue type.
   *
   * @internal
   */
  readonly '~types'?:
    | {
        readonly input: TInput;
        readonly output: TInput;
        readonly issue: never;
      }
    | undefined;
}

/**
 * Generic metadata type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericMetadata<TInput = any> = BaseMetadata<TInput>;
