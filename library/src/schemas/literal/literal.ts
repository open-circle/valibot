import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema, _stringify } from '../../utils/index.ts';

/**
 * Literal type.
 */
export type Literal = bigint | boolean | number | string | symbol;

/**
 * Literal issue interface.
 */
export interface LiteralIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'literal';
  /**
   * The expected property.
   */
  readonly expected: string;
}

/**
 * Literal schema interface.
 */
export interface LiteralSchema<
  TLiteral extends Literal,
  TMessage extends ErrorMessage<LiteralIssue> | undefined,
> extends BaseSchema<TLiteral, TLiteral, LiteralIssue> {
  /**
   * The schema type.
   */
  readonly type: 'literal';
  /**
   * The schema reference.
   */
  readonly reference: typeof literal;
  /**
   * The literal value.
   */
  readonly literal: TLiteral;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a literal schema.
 *
 * @param literal_ The literal value.
 *
 * @returns A literal schema.
 */
export function literal<const TLiteral extends Literal>(
  literal_: TLiteral
): LiteralSchema<TLiteral, undefined>;

/**
 * Creates a literal schema.
 *
 * @param literal_ The literal value.
 * @param message The error message.
 *
 * @returns A literal schema.
 */
export function literal<
  const TLiteral extends Literal,
  const TMessage extends ErrorMessage<LiteralIssue> | undefined,
>(literal_: TLiteral, message: TMessage): LiteralSchema<TLiteral, TMessage>;

// @__NO_SIDE_EFFECTS__
export function literal(
  literal_: Literal,
  message?: ErrorMessage<LiteralIssue>
): LiteralSchema<Literal, ErrorMessage<LiteralIssue> | undefined> {
  return _standardSchema<
    LiteralSchema<Literal, ErrorMessage<LiteralIssue> | undefined>
  >({
    kind: 'schema',
    type: 'literal',
    reference: literal,
    expects: _stringify(literal_),
    async: false,
    literal: literal_,
    message,
    '~run'(
      this: LiteralSchema<Literal, ErrorMessage<LiteralIssue> | undefined>,
      dataset,
      config
    ) {
      if (dataset.value === this.literal) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<Literal, LiteralIssue>;
    },
  });
}
