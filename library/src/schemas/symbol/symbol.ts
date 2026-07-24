import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * Symbol issue interface.
 */
export interface SymbolIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'symbol';
  /**
   * The expected property.
   */
  readonly expected: 'symbol';
}

/**
 * Symbol schema interface.
 */
export interface SymbolSchema<
  TMessage extends ErrorMessage<SymbolIssue> | undefined,
> extends BaseSchema<symbol, symbol, SymbolIssue> {
  /**
   * The schema type.
   */
  readonly type: 'symbol';
  /**
   * The schema reference.
   */
  readonly reference: typeof symbol;
  /**
   * The expected property.
   */
  readonly expects: 'symbol';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a symbol schema.
 *
 * @returns A symbol schema.
 */
export function symbol(): SymbolSchema<undefined>;

/**
 * Creates a symbol schema.
 *
 * @param message The error message.
 *
 * @returns A symbol schema.
 */
export function symbol<
  const TMessage extends ErrorMessage<SymbolIssue> | undefined,
>(message: TMessage): SymbolSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function symbol(
  message?: ErrorMessage<SymbolIssue>
): SymbolSchema<ErrorMessage<SymbolIssue> | undefined> {
  return _standardSchema<SymbolSchema<ErrorMessage<SymbolIssue> | undefined>>({
    kind: 'schema',
    type: 'symbol',
    reference: symbol,
    expects: 'symbol',
    async: false,
    message,
    '~run'(
      this: SymbolSchema<ErrorMessage<SymbolIssue> | undefined>,
      dataset,
      config
    ) {
      if (typeof dataset.value === 'symbol') {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<symbol, SymbolIssue>;
    },
  });
}
