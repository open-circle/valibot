import type {
  BaseIssue,
  Config,
  OutputDataset,
  PipeItem,
  UnknownDataset,
} from '../../types/index.ts';
import { _assertPipeEncodable } from './_assertPipeEncodable.ts';
import { _getPreviousSchema } from './_getPreviousSchema.ts';

/**
 * Runs a pipeline backward or checks its output type without conversions.
 *
 * @param pipe The pipeline items.
 * @param dataset The input dataset.
 * @param config The execution configuration.
 *
 * @returns The resulting dataset.
 *
 * @internal
 */
export function _runBackwardPipe(
  pipe: readonly PipeItem<unknown, unknown, BaseIssue<unknown>>[],
  dataset: UnknownDataset,
  config: Config<BaseIssue<unknown>>
): OutputDataset<unknown, BaseIssue<unknown>> {
  _assertPipeEncodable(pipe);
  let output: OutputDataset<unknown, BaseIssue<unknown>> = {
    typed: true,
    value: dataset.value,
  };
  if (config['~typeCheckOnly']) {
    const schema = _getPreviousSchema(pipe, pipe.length);
    return schema?.['~run']({ value: dataset.value }, config) ?? output;
  }

  let needsGuard = true;
  for (let index = pipe.length - 1; index >= 0; index--) {
    const item = pipe[index];
    if (item.kind === 'schema') {
      if (output.issues) {
        output.typed = false;
        return output;
      }
      output = item['~run']({ value: output.value }, config);
      needsGuard = true;
      continue;
    }
    if (item.kind !== 'validation') {
      continue;
    }

    // Each group of checks belongs to the preceding schema's output.
    if (needsGuard && output.typed) {
      const schema = _getPreviousSchema(pipe, index);
      const guarded = schema?.['~run'](
        { value: output.value },
        { ...config, '~typeCheckOnly': true }
      );
      if (guarded && !guarded.typed) {
        return guarded;
      }
      needsGuard = false;
    }
    if (output.issues && (config.abortEarly || config.abortPipeEarly)) {
      continue;
    }
    output = item['~run'](output, config);
  }
  return output;
}
