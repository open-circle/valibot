import type {
  BaseIssue,
  Config,
  OutputDataset,
  PipeItem,
  UnknownDataset,
} from '../../types/index.ts';

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
  // Type-only actions are identities. Other transformations have no inverse.
  for (const item of pipe) {
    if (
      item.kind === 'transformation' &&
      item.type !== 'brand' &&
      item.type !== 'flavor' &&
      item.type !== 'readonly'
    ) {
      throw new Error(
        `Cannot encode unidirectional transformation: ${item.type}`
      );
    }
  }
  let output: OutputDataset<unknown, BaseIssue<unknown>> = {
    typed: true,
    value: dataset.value,
  };
  if (config['~direction'] === 'output') {
    for (let index = pipe.length - 1; index >= 0; index--) {
      const item = pipe[index];
      if (item.kind === 'schema') {
        return item['~run']({ value: dataset.value }, config);
      }
    }
  } else {
    let needsGuard = true;
    for (let index = pipe.length - 1; index >= 0; index--) {
      const item = pipe[index];
      if (item.kind === 'schema') {
        if (output.issues) {
          output.typed = false;
          break;
        }
        output = item['~run']({ value: output.value }, config);
        needsGuard = true;
      } else if (item.kind === 'validation') {
        // Each group of checks belongs to the preceding schema's output.
        if (needsGuard && output.typed) {
          for (let guardIndex = index - 1; guardIndex >= 0; guardIndex--) {
            const schema = pipe[guardIndex];
            if (schema.kind === 'schema') {
              const guarded = schema['~run'](
                { value: output.value },
                { ...config, '~direction': 'output' }
              );
              if (!guarded.typed) {
                return guarded;
              }
              break;
            }
          }
          needsGuard = false;
        }
        if (!output.issues || (!config.abortEarly && !config.abortPipeEarly)) {
          output = item['~run'](output, config);
        }
      }
    }
  }
  return output;
}
