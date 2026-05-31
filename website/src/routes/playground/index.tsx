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
// Self-contained playground bundles of `@valibot/i18n`. Each language registers
// all of its messages and keeps `valibot` as an external bare import, so it
// shares the same instance as the user code via the import map below. These are
// produced by `pnpm build.playground` in `packages/i18n`; run it before
// building or starting the website (see website/README.md).
import i18nAr from '../../../../packages/i18n/dist/playground/ar/index.mjs?url';
import i18nAz from '../../../../packages/i18n/dist/playground/az/index.mjs?url';
import i18nCa from '../../../../packages/i18n/dist/playground/ca/index.mjs?url';
import i18nCs from '../../../../packages/i18n/dist/playground/cs/index.mjs?url';
import i18nDe from '../../../../packages/i18n/dist/playground/de/index.mjs?url';
import i18nEl from '../../../../packages/i18n/dist/playground/el/index.mjs?url';
import i18nEs from '../../../../packages/i18n/dist/playground/es/index.mjs?url';
import i18nFa from '../../../../packages/i18n/dist/playground/fa/index.mjs?url';
import i18nFi from '../../../../packages/i18n/dist/playground/fi/index.mjs?url';
import i18nFr from '../../../../packages/i18n/dist/playground/fr/index.mjs?url';
import i18nHu from '../../../../packages/i18n/dist/playground/hu/index.mjs?url';
import i18nId from '../../../../packages/i18n/dist/playground/id/index.mjs?url';
import i18nIt from '../../../../packages/i18n/dist/playground/it/index.mjs?url';
import i18nJa from '../../../../packages/i18n/dist/playground/ja/index.mjs?url';
import i18nKo from '../../../../packages/i18n/dist/playground/ko/index.mjs?url';
import i18nKr from '../../../../packages/i18n/dist/playground/kr/index.mjs?url';
import i18nMn from '../../../../packages/i18n/dist/playground/mn/index.mjs?url';
import i18nNb from '../../../../packages/i18n/dist/playground/nb/index.mjs?url';
import i18nNl from '../../../../packages/i18n/dist/playground/nl/index.mjs?url';
import i18nPl from '../../../../packages/i18n/dist/playground/pl/index.mjs?url';
import i18nPt from '../../../../packages/i18n/dist/playground/pt/index.mjs?url';
import i18nRo from '../../../../packages/i18n/dist/playground/ro/index.mjs?url';
import i18nRu from '../../../../packages/i18n/dist/playground/ru/index.mjs?url';
import i18nSk from '../../../../packages/i18n/dist/playground/sk/index.mjs?url';
import i18nSl from '../../../../packages/i18n/dist/playground/sl/index.mjs?url';
import i18nSv from '../../../../packages/i18n/dist/playground/sv/index.mjs?url';
import i18nTr from '../../../../packages/i18n/dist/playground/tr/index.mjs?url';
import i18nUk from '../../../../packages/i18n/dist/playground/uk/index.mjs?url';
import i18nUz from '../../../../packages/i18n/dist/playground/uz/index.mjs?url';
import i18nVi from '../../../../packages/i18n/dist/playground/vi/index.mjs?url';
import i18nZhCN from '../../../../packages/i18n/dist/playground/zh-CN/index.mjs?url';
import i18nZhTW from '../../../../packages/i18n/dist/playground/zh-TW/index.mjs?url';
import valibotToJsonSchemaCode from '../../../../packages/to-json-schema/dist/index.min.mjs?url';
import editorCode from './editorCode.ts?raw';
import iframeCode from './iframeCode.js?raw';

// Serialize the iframe import map with Valibot, to-json-schema and i18n. Each
// language is exposed as `@valibot/i18n/<lang>` (the whole-language entry).
const importMap = JSON.stringify({
  imports: {
    valibot: valibotCode,
    '@valibot/to-json-schema': valibotToJsonSchemaCode,
    '@valibot/i18n/ar': i18nAr,
    '@valibot/i18n/az': i18nAz,
    '@valibot/i18n/ca': i18nCa,
    '@valibot/i18n/cs': i18nCs,
    '@valibot/i18n/de': i18nDe,
    '@valibot/i18n/el': i18nEl,
    '@valibot/i18n/es': i18nEs,
    '@valibot/i18n/fa': i18nFa,
    '@valibot/i18n/fi': i18nFi,
    '@valibot/i18n/fr': i18nFr,
    '@valibot/i18n/hu': i18nHu,
    '@valibot/i18n/id': i18nId,
    '@valibot/i18n/it': i18nIt,
    '@valibot/i18n/ja': i18nJa,
    '@valibot/i18n/ko': i18nKo,
    '@valibot/i18n/kr': i18nKr,
    '@valibot/i18n/mn': i18nMn,
    '@valibot/i18n/nb': i18nNb,
    '@valibot/i18n/nl': i18nNl,
    '@valibot/i18n/pl': i18nPl,
    '@valibot/i18n/pt': i18nPt,
    '@valibot/i18n/ro': i18nRo,
    '@valibot/i18n/ru': i18nRu,
    '@valibot/i18n/sk': i18nSk,
    '@valibot/i18n/sl': i18nSl,
    '@valibot/i18n/sv': i18nSv,
    '@valibot/i18n/tr': i18nTr,
    '@valibot/i18n/uk': i18nUk,
    '@valibot/i18n/uz': i18nUz,
    '@valibot/i18n/vi': i18nVi,
    '@valibot/i18n/zh-CN': i18nZhCN,
    '@valibot/i18n/zh-TW': i18nZhTW,
  },
});

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
    if (window.innerWidth < 1024 && !toggle.value) {
      toggle.value = true;
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
                ${importMap}
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
