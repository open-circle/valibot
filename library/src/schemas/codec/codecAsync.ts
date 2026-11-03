import type {
  BaseIssue,
  BaseSchemaAsync,
  GenericSchema,
  GenericSchemaAsync,
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
  SuccessDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';
import type {
  CodecContext,
  CodecIssue,
  CodecOperationsAsync,
} from './types.ts';

/**
 * Async codec schema interface.
 */
export interface CodecSchemaAsync<
  TEncoded extends GenericSchema | GenericSchemaAsync,
  TDecoded extends GenericSchema | GenericSchemaAsync,
> extends BaseSchemaAsync<
    InferInput<TEncoded>,
    InferOutput<TDecoded>,
    InferIssue<TEncoded | TDecoded> | CodecIssue<unknown>
  > {
  readonly type: 'codec';
  readonly reference: typeof codecAsync;
  readonly encoded: TEncoded;
  readonly decoded: TDecoded;
  readonly operations: CodecOperationsAsync<TEncoded, TDecoded>;
}

/**
 * Creates an async codec that validates and converts between two schemas.
 *
 * @param encoded The encoded schema.
 * @param decoded The decoded schema.
 * @param operations The decode and encode operations.
 *
 * @returns An async codec schema.
 */
// @__NO_SIDE_EFFECTS__
export function codecAsync<
  const TEncoded extends GenericSchema | GenericSchemaAsync,
  const TDecoded extends GenericSchema | GenericSchemaAsync,
>(
  encoded: TEncoded,
  decoded: TDecoded,
  operations: CodecOperationsAsync<TEncoded, TDecoded>
): CodecSchemaAsync<TEncoded, TDecoded> {
  return _standardSchema({
    kind: 'schema',
    type: 'codec',
    reference: codecAsync,
    expects: encoded.expects,
    async: true,
    encoded,
    decoded,
    operations,
    async '~run'(dataset, config) {
      // Validate the decoded representation without executing conversions.
      if (config['~typeCheckOnly']) {
        return (await this.decoded['~run'](dataset, config)) as OutputDataset<
          InferOutput<TDecoded>,
          InferIssue<TEncoded | TDecoded> | CodecIssue<unknown>
        >;
      }
      const encoding = config['~direction'] === 'encode';
      let output: OutputDataset<unknown, BaseIssue<unknown>> = await (
        encoding ? this.decoded : this.encoded
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
      const value = encoding
        ? await this.operations.encode(
            output.value as InferInput<TDecoded>,
            context as CodecContext<InferInput<TDecoded>>
          )
        : await this.operations.decode(
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
        output = await (encoding ? this.encoded : this.decoded)['~run'](
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
