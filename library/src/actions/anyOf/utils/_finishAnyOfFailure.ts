import type {
  BaseIssue,
  Config,
  ErrorMessage,
  OutputDataset,
} from '../../../types/index.ts';
import { _addIssue, _subIssues } from '../../../utils/index.ts';
import type { AnyOfAction, AnyOfOptions } from '../anyOf.ts';
import type { AnyOfActionAsync, AnyOfOptionsAsync } from '../anyOfAsync.ts';
import type { AnyOfIssue } from '../types.ts';

type Message = ErrorMessage<AnyOfIssue<BaseIssue<unknown>>> | undefined;

/**
 * Adds the combined issue and keeps the first partial output, when present.
 *
 * @param action The action reporting the issue.
 * @param dataset The incoming dataset.
 * @param config The parsing configuration.
 * @param datasets The failed alternatives in evaluation order.
 *
 * @returns The dataset with the combined issue.
 *
 * @internal
 */
export function _finishAnyOfFailure(
  action:
    | AnyOfAction<AnyOfOptions, Message>
    | AnyOfActionAsync<AnyOfOptionsAsync, Message>,
  dataset: OutputDataset<unknown, BaseIssue<unknown>>,
  config: Config<BaseIssue<unknown>>,
  datasets: OutputDataset<unknown, BaseIssue<unknown>>[] | undefined
): OutputDataset<unknown, BaseIssue<unknown>> {
  const issues = _subIssues(datasets);

  if (!issues) {
    throw new TypeError(
      'The any of options must return issues when they fail.'
    );
  }

  _addIssue(action, 'input', dataset, config, { issues });

  const partial = datasets?.find((optionDataset) => optionDataset.typed);
  if (partial) {
    dataset.value = partial.value;
  } else {
    dataset.typed = false;
  }

  return dataset;
}
