import type {
  BaseIssue,
  BaseSchema,
  GenericSchema,
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
  SuccessDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';
import type { CodecContext, CodecIssue, CodecOperations } from './types.ts';

/**
 * Codec schema interface.
 */
export interface CodecSchema<
  TEncoded extends GenericSchema,
  TDecoded extends GenericSchema,
> extends BaseSchema<
    InferInput<TEncoded>,
    InferOutput<TDecoded>,
    InferIssue<TEncoded | TDecoded> | CodecIssue<unknown>
  > {
  readonly type: 'codec';
  readonly reference: typeof codec;
  readonly encoded: TEncoded;
  readonly decoded: TDecoded;
  readonly operations: CodecOperations<TEncoded, TDecoded>;
}

/**
 * Creates a codec that validates and converts between two schemas.
 *
 * @param encoded The encoded schema.
 * @param decoded The decoded schema.
 * @param operations The decode and encode operations.
 *
 * @returns A codec schema.
 */
// @__NO_SIDE_EFFECTS__
export function codec<
  const TEncoded extends GenericSchema,
  const TDecoded extends GenericSchema,
>(
  encoded: TEncoded,
  decoded: TDecoded,
  operations: CodecOperations<TEncoded, TDecoded>
): CodecSchema<TEncoded, TDecoded> {
  return _standardSchema({
    kind: 'schema',
    type: 'codec',
    reference: codec,
    expects: encoded.expects,
    async: false,
    encoded,
    decoded,
    operations,
    '~run'(dataset, config) {
      // Validate the decoded representation without executing conversions.
      if (config['~direction'] === 'output') {
        return this.decoded['~run'](dataset, config) as OutputDataset<
          InferOutput<TDecoded>,
          InferIssue<TEncoded | TDecoded> | CodecIssue<unknown>
        >;
      }
      const backward = config['~direction'] === 'backward';
      let output: OutputDataset<unknown, BaseIssue<unknown>> = (
        backward ? this.decoded : this.encoded
      )['~run'](dataset, config);
      if (output.issues) {
        return { ...output, typed: false };
      }
      const context: CodecContext<unknown> = {
        dataset: output as SuccessDataset<unknown>,
        config,
        addIssue: (info) =>
          _addIssue(this, info?.label ?? 'input', output, config, info),
        NEVER: null as never,
      };
      const value = backward
        ? this.operations.encode(
            output.value as InferInput<TDecoded>,
            context as CodecContext<InferInput<TDecoded>>
          )
        : this.operations.decode(
            output.value as InferOutput<TEncoded>,
            context as CodecContext<InferOutput<TEncoded>>
          );
      const issues = (output as OutputDataset<unknown, BaseIssue<unknown>>)
        .issues;
      if (issues) {
        return { value: output.value, typed: false, issues } as OutputDataset<
          InferOutput<TDecoded>,
          InferIssue<TEncoded | TDecoded> | CodecIssue<unknown>
        >;
      } else {
        output = (backward ? this.encoded : this.decoded)['~run'](
          { value },
          config
        );
      }
      return output as OutputDataset<
        InferOutput<TDecoded>,
        InferIssue<TEncoded | TDecoded> | CodecIssue<unknown>
      >;
    },
  });
}
