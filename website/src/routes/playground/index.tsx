import {
  $,
  component$,
  type NoSerialize,
  type QRL,
  type Signal,
  sync$,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik';
import {
  type DocumentHead,
  useLocation,
  useNavigate,
} from '@builder.io/qwik-city';
import clsx from 'clsx';
import lz from 'lz-string';
import type * as monaco from 'monaco-editor';
import { transform } from 'sucrase';
import {
  CodeEditor,
  IconButton,
  SideBar,
  useSideBarToggle,
} from '~/components';
import { useResetSignal } from '~/hooks';
import { BinIcon, CheckIcon, CopyIcon, PlayIcon, ShareIcon } from '~/icons';
import { trackEvent } from '~/utils';
import valibotCode from '../../../../library/dist/index.min.mjs?url';
import valibotToJsonSchemaCode from '../../../../packages/to-json-schema/dist/index.min.mjs?url';
import editorCode from './editorCode.ts?raw';
import iframeCode from './iframeCode.js?raw';

type LogLevel = 'log' | 'info' | 'debug' | 'warn' | 'error';

type MessageEventData = {
  type: 'log';
  log: [LogLevel, string];
};

export const head: DocumentHead = {
  title: 'Playground',
  meta: [
    {
      name: 'description',
      content:
        "Write, test, and share your Valibot schemas instantly. Unleash your creativity with Valibot's online code editor.",
    },
  ],
};

export default component$(() => {
  // Use navigate, location and side bar toggle
  const navigate = useNavigate();
  const location = useLocation();
  const toggle = useSideBarToggle();

  // Use editor and side bar elements signals
  const editorElement = useSignal<HTMLElement>();
  const sideBarElement = useSignal<HTMLElement>();

  // Use model and logs signals
  const model = useSignal<NoSerialize<monaco.editor.ITextModel>>();
  const logs = useSignal<[LogLevel, string][]>([]);

  // Use iframe, logs and last log element signals
  const iframeElement = useSignal<HTMLIFrameElement>();
  const logsElement = useSignal<HTMLOListElement>();
  const lastLogElement = useSignal<Element | null>();

  // Computed initial code of editor
  const initialCode = useComputed$(() => {
    const code = location.url.searchParams.get('code');
    return code ? lz.decompressFromEncodedURIComponent(code) : editorCode;
  });

  /**
   * Changes the width of the side bar via pointer move.
   */
  const changeSideBarWidth = $(() => {
    // Disable text selection and overflow while resizing
    document.body.style.userSelect = 'none';
    editorElement.value!.style.overflow = 'hidden';

    // Create function to change side bar width
    let currentWidth = sideBarElement.value!.clientWidth;
    const maxWidth = Math.min(1700, window.innerWidth) * 0.6;
    const onPointerMove = (event: PointerEvent) => {
      currentWidth -= event.movementX;
      if (currentWidth > 250 && currentWidth < maxWidth) {
        sideBarElement.value!.style.width = `${currentWidth}px`;
      }
    };

    // Create function to reset styles and remove event listener
    const onPointerUp = () => {
      document.body.style.userSelect = '';
      editorElement.value!.style.overflow = '';
      window.removeEventListener('pointermove', onPointerMove);
    };

    // Add pointer move and up event listeners
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });

    // Track resize playground event
    trackEvent('resize_playground');
  });

  /**
   * Resets the width of the side bar on smaller devices.
   */
  const resetSideBarWidth = $(() => {
    if (window.innerWidth <= 1024) {
      sideBarElement.value!.style.width = '';
    }
  });

  /**
   * Saves the current code of the editor.
   */
  const saveCode = $(async () => {
    // Add compressed code to search params
    await navigate(
      `?code=${lz.compressToEncodedURIComponent(model.value!.getValue())}`,
      { replaceState: true }
    );

    // Track playground event
    trackEvent('save_playground_code');
  });

  /**
   * Executes the current code of the editor.
   */
  const executeCode = $(() => {
    // Open side bar on smaller devices if it's closed
    if (
      window.innerWidth < 1024 &&
      (!toggle.value || toggle.value.state === 'closed')
    ) {
      toggle.submit({ state: 'opened' });
    }

    // Update code of iframe
    try {
      iframeElement.value!.contentWindow!.postMessage(
        {
          type: 'code',
          code: transform(model.value!.getValue(), {
            transforms: ['typescript'],
          }).code,
        },
        '*'
      );

      // Handle transform errors
    } catch {
      logs.value = [
        ...logs.value,
        ['error', 'TypeScript syntax error detected'],
      ];
    }

    // Track playground event
    trackEvent('execute_playground_code');
  });

  /**
   * Captures logs from the iframe.
   */
  const captureLogs = $((event: MessageEvent<MessageEventData>) => {
    if (event.data.type === 'log') {
      logs.value = [...logs.value, event.data.log];
    }
  });

  /**
   * Clears the logs of the playground.
   */
  const clearLogs = $(() => {
    // Reset logs signal
    logs.value = [];

    // Track playground event
    trackEvent('clear_playground_logs');
  });

  /**
   * Handles keyboard keydown events.
   */
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'Enter') {
        executeCode();
      } else if (event.key === 'Backspace') {
        clearLogs();
      }
    }
  });

  /**
   * Prevents default behavior of keydown events.
   */
  const preventDefault = sync$((event: KeyboardEvent) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 'Enter' || event.key === 'Backspace')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  // Scroll newest logs into view
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(logs);
    lastLogElement.value?.nextElementSibling?.scrollIntoView();
    lastLogElement.value = logsElement.value?.lastElementChild;
  });

  return (
    <main
      class="flex w-full flex-1 flex-col lg:flex-row lg:gap-5 lg:px-10 lg:py-20 2xl:max-w-[1700px] 2xl:gap-7 2xl:self-center"
      window:onMessage$={captureLogs}
      window:onKeyDown$={[preventDefault, handleKeyDown]}
      window:onResize$={resetSideBarWidth}
    >
      <div ref={editorElement} class="flex flex-1 overflow-visible lg:relative">
        <CodeEditor
          class="lg:rounded-3xl lg:border-[3px] lg:border-slate-200 lg:dark:border-slate-800"
          value={initialCode}
          model={model}
          onSave$={saveCode}
        />
        <EditorButtons
          class="hidden! lg:absolute! lg:top-10 lg:right-10 lg:z-10 lg:flex!"
          model={model}
          executeCode$={executeCode}
        />
      </div>

      <div
        class="group hidden lg:flex lg:w-3 lg:cursor-col-resize lg:justify-center"
        onPointerDown$={changeSideBarWidth}
      >
        <div class="lg:invisible lg:h-full lg:w-[3px] lg:rounded lg:bg-slate-200/50 lg:group-hover:visible lg:dark:bg-slate-800/50" />
      </div>

      <SideBar
        ref={sideBarElement}
        class="lg:w-80 xl:w-96 2xl:w-[500px]"
        toggle={toggle}
      >
        <EditorButtons
          q:slot="buttons"
          class="mr-4 lg:hidden"
          model={model}
          executeCode$={executeCode}
        />
        <IconButton
          class="absolute! top-8 right-8 z-10 lg:top-10 lg:right-10"
          type="button"
          variant="secondary"
          label="Clear logs"
          hideLabel
          onClick$={clearLogs}
        >
          <BinIcon class="h-[18px]" />
        </IconButton>
        <ol
          ref={logsElement}
          class="flex h-full flex-col items-start overflow-auto overscroll-contain scroll-smooth px-8 py-9 lg:absolute lg:w-full lg:rounded-3xl lg:border-[3px] lg:border-slate-200 lg:p-10 lg:dark:border-slate-800"
        >
          {logs.value.map(([level, message], index) => (
            <li key={index} class="scroll-mx-8 scroll-my-9 lg:scroll-m-10">
              <pre class="lg:text-lg">
                [
                <span
                  class={clsx(
                    'font-medium uppercase',
                    level === 'error'
                      ? 'text-red-600 dark:text-red-400'
                      : level === 'warn'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-sky-600 dark:text-sky-400'
                  )}
                >
                  {level}
                </span>
                ]: <span dangerouslySetInnerHTML={message} />
              </pre>
            </li>
          ))}
        </ol>
      </SideBar>

      <iframe
        ref={iframeElement}
        hidden
        sandbox="allow-scripts"
        srcdoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <script type="importmap">
                {
                  "imports": {
                    "valibot": "${valibotCode}",
                    "@valibot/to-json-schema": "${valibotToJsonSchemaCode}"
                  }
                }
              </script>
              <script>
                ${iframeCode}
              </script>
            </head>
            <body></body>
          </html>
        `}
      />
    </main>
  );
});

type EditorButtonsProps = {
  class: string;
  model: Signal<NoSerialize<monaco.editor.ITextModel>>;
  executeCode$: QRL<() => void>;
};

const EditorButtons = component$<EditorButtonsProps>(
  ({ model, executeCode$, ...props }) => {
    // Use navigate and location
    const navigate = useNavigate();
    const location = useLocation();

    // Use copied and shared reset signal
    const copied = useResetSignal(false);
    const shared = useResetSignal(false);

    /**
     * Copies the current code of the editor.
     */
    const copyCode = $(() => {
      // Copy code to clipboard
      copied.value = true;
      navigator.clipboard.writeText(model.value!.getValue());

      // Track playground event
      trackEvent('copy_playground_code');
    });

    /**
     * Shares the current code of the editor.
     */
    const shareCode = $(async () => {
      // Add compressed code to search params
      await navigate(
        `?code=${lz.compressToEncodedURIComponent(model.value!.getValue())}`,
        { replaceState: true }
      );

      // Get current URL with search params
      const url = location.url.href;

      // Share URL or copy it to clipboard
      if (navigator.share) {
        navigator.share({ title: 'Playground', url });
      } else {
        shared.value = true;
        navigator.clipboard.writeText(url);
      }

      // Track playground event
      trackEvent('share_playground_code');
    });

    return (
      <div class={clsx('flex gap-6', props.class)}>
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
        <IconButton
          type="button"
          variant="secondary"
          label="Share code"
          hideLabel
          onClick$={shareCode}
        >
          {shared.value ? (
            <CheckIcon class="h-[18px]" />
          ) : (
            <ShareIcon class="h-[18px]" />
          )}
        </IconButton>
        <IconButton
          type="button"
          variant="secondary"
          label="Execute code"
          hideLabel
          onClick$={executeCode$}
        >
          <PlayIcon class="h-[16px]" />
        </IconButton>
      </div>
    );
  }
);
