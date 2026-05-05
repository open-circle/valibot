import {
  $,
  component$,
  Slot,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik';
import lz from 'lz-string';
import { IconButton } from '~/components';
import { useResetSignal } from '~/hooks';
import { CheckIcon, CopyIcon, PlayIcon } from '~/icons';
import { trackEvent } from '~/utils';

type PreProps = {
  class: string;
};

/**
 * Pre component for rendering code snippets.
 */
const Pre = component$<PreProps>((props) => {
  // Use element and state signals
  const preElement = useSignal<HTMLPreElement>();
  const isValibotCode = useSignal(false);
  const copied = useResetSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (
      props.class === 'language-ts' &&
      preElement.value?.innerText.includes("import * as v from 'valibot'")
    ) {
      isValibotCode.value = true;
    }
  });

  /**
   * Copies the current code of the <pre /> element to the clipboard.
   */
  const copyCode = $(() => {
    // Copy code to clipboard
    copied.value = true;
    navigator.clipboard.writeText(preElement.value!.innerText);

    // Track copy event
    trackEvent('copy_code_snippet');
  });

  /**
   * Opens the current code of the <pre /> in the playground.
   */
  const openPlayground = $(() => {
    // Open playground
    window.open(
      `/playground/?code=${lz.compressToEncodedURIComponent(preElement.value!.innerText)}`,
      '_blank'
    );

    // Track open event
    trackEvent('open_code_snippet_in_playground');
  });

  return (
    <div class="code-wrapper group/code relative overflow-hidden rounded-2xl border-2 border-slate-200 lg:rounded-3xl lg:border-[3px] dark:border-slate-800">
      <div class="absolute top-5 right-5 hidden gap-5 group-hover/code:flex lg:top-10 lg:right-10">
        <IconButton
          type="button"
          variant="secondary"
          label="Copy code"
          hideLabel
          onClick$={copyCode}
        >
          {copied.value ? (
            <CheckIcon class="h-[18px]" />
          ) : (
            <CopyIcon class="h-[18px]" />
          )}
        </IconButton>
        {isValibotCode.value && (
          <IconButton
            type="button"
            variant="secondary"
            label="Execute code"
            hideLabel
            onClick$={openPlayground}
          >
            <PlayIcon class="h-[16px]" />
          </IconButton>
        )}
      </div>
      <pre
        ref={preElement}
        class="flex min-h-20 items-center overflow-x-auto p-5 leading-relaxed text-slate-700 md:text-lg lg:min-h-[120px] lg:p-10 lg:text-xl dark:text-slate-300"
      >
        <Slot />
      </pre>
    </div>
  );
});

/**
 * Hook that provides custom MDX components.
 */
export function useMDXComponents() {
  return { pre: Pre };
}
