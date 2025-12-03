import {
  $,
  component$,
  type NoSerialize,
  noSerialize,
  type QRL,
  type Signal,
  sync$,
  useComputed$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from '@builder.io/qwik';
import { isBrowser } from '@builder.io/qwik/build';
import clsx from 'clsx';
import * as monaco from 'monaco-editor';
import { wireTmGrammars } from 'monaco-editor-textmate';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { Registry } from 'monaco-textmate';
import { loadWASM } from 'onigasm';
import onigasm from 'onigasm/lib/onigasm.wasm?url';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettierPluginTypeScript from 'prettier/plugins/typescript';
import { formatWithCursor } from 'prettier/standalone';
import { useTheme } from '~/routes/plugin@theme';
import valibotTypes from '../../../library/dist/index.d.mts?raw';
import valibotPackageJson from '../../../library/package.json?raw';
import valibotToJsonSchemaTypes from '../../../packages/to-json-schema/dist/index.d.mts?raw';
import valibotToJsonSchemaPackageJson from '../../../packages/to-json-schema/package.json?raw';
import typescriptTm from '../json/TypeScript.tmLanguage.json';

type CodeEditorProps = {
  class: string;
  value: Signal<string>;
  model: Signal<NoSerialize<monaco.editor.ITextModel>>;
  onSave$?: QRL<() => void>;
};

/**
 * Monaco code editor with TypeScript support and syntax highlighting.
 */
export const CodeEditor = component$<CodeEditorProps>(
  ({ value, model, onSave$, ...props }) => {
    // Use theme
    const theme = useTheme();

    // Use element and editor signal
    const element = useSignal<HTMLElement>();
    const editor =
      useSignal<NoSerialize<monaco.editor.IStandaloneCodeEditor>>();

    // Compute editor theme name
    const editorTheme = useComputed$(() =>
      theme.value === 'dark' ? 'pace-dark' : 'pace-light'
    );

    /**
     * Returns device specific editor options.
     */
    const getDeviceOptions = $(() =>
      window.innerWidth <= 640
        ? {
            fontSize: 16,
            padding: { top: 20, bottom: 20 },
            lineNumbersMinChars: 3,
          }
        : {
            fontSize: 18,
            padding: { top: 40, bottom: 40 },
            lineNumbersMinChars: 4,
          }
    );

    // Initialize and setup Monaco editor
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ cleanup }) => {
      // Initialize Monaco editor environment
      await initializeMonaco();

      // Create model for Monaco editor instance
      model.value = noSerialize(
        monaco.editor.createModel(
          value.value,
          'typescript',
          monaco.Uri.parse('file:///index.ts')
        )
      );

      // Create Monaco editor instance with model
      editor.value = noSerialize(
        monaco.editor.create(element.value!, {
          ...(await getDeviceOptions()),
          autoDetectHighContrast: false,
          automaticLayout: true,
          // @ts-expect-error
          'bracketPairColorization.enabled': false,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          model: model.value,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          theme: editorTheme.value,
        })
      );

      // Dispose editor and model on cleanup
      cleanup(() => {
        editor.value!.dispose();
        model.value!.dispose();
      });
    });

    // Update theme on change
    useTask$(async ({ track }) => {
      track(editorTheme);
      if (isBrowser) {
        editor.value?.updateOptions({
          theme: editorTheme.value,
        });
      }
    });

    /**
     * Updates the device options of the code editor.
     */
    const updateDeviceOptions = $(async () =>
      editor.value?.updateOptions(await getDeviceOptions())
    );

    /**
     * Handles keyboard keydown events.
     */
    const handleKeyDown = $(async (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        // Format code with Prettier
        try {
          const prettier = await formatWithCursor(model.value!.getValue(), {
            cursorOffset: model.value!.getOffsetAt(
              editor.value!.getPosition()!
            ),
            parser: 'typescript',
            plugins: [prettierPluginEstree, prettierPluginTypeScript],
            singleQuote: true,
          });
          model.value!.pushEditOperations(
            null,
            [
              {
                range: model.value!.getFullModelRange(),
                text: prettier.formatted,
              },
            ],
            () => null
          );
          editor.value!.setPosition(
            model.value!.getPositionAt(prettier.cursorOffset)
          );
        } catch {
          // Ignore formatting errors
        }

        // Execute save event
        onSave$?.();
      }
    });

    /**
     * Prevents default behavior of keydown events.
     */
    const preventDefault = sync$((event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
      }
    });

    return (
      <div
        class={clsx('w-full', props.class)}
        ref={element}
        window:onResize$={updateDeviceOptions}
        onKeyDown$={[preventDefault, handleKeyDown]}
      />
    );
  }
);

/**
 * Sets up the Monaco editor environment.
 */
async function setupMonaco() {
  // Load Onigasm WebAssembly module
  await loadWASM(onigasm);

  // Wire TypeScript TextMate grammar
  await wireTmGrammars(
    monaco,
    new Registry({
      getGrammarDefinition: async () => ({
        format: 'json',
        content: typescriptTm,
      }),
    }),
    new Map().set('typescript', 'source.ts')
  );

  // Setup TypeScript and edior workers
  window.MonacoEnvironment = {
    getWorker: (_, label) =>
      label === 'typescript' ? new tsWorker() : new editorWorker(),
  };

  // Define pace dark mode theme
  monaco.editor.defineTheme('pace-dark', {
    base: 'vs-dark',
    inherit: false,
    colors: {
      'editor.foreground': '#CBD5E1',
      'editor.background': '#111827',
      'editor.selectionBackground': '#334155',
      'editor.lineHighlightBackground': '#1E293B',
      'editorCursor.foreground': '#E2E8F0',
      'editorHoverWidget.border': '#1E293B',
      'editorLineNumber.foreground': '#64748B',
      'editorLineNumber.activeForeground': '#CBD5E1',
      'editorIndentGuide.background': '#334155',
      'editorWhitespace.foreground': '#334155',
      'editorWidget.background': '#0A101C',
      'scrollbarSlider.activeBackground': '#64748B80',
      'scrollbarSlider.background': '#33415580',
      'scrollbarSlider.hoverBackground': '#47556980',
    },
    rules: [
      {
        token: 'comment',
        foreground: '#6B7280',
      },
      {
        token: 'string',
        foreground: '#FDE68A',
      },
      {
        token: 'string.regex',
        foreground: '#CBD5E1',
      },
      {
        token: 'constant',
        foreground: '#2DD4BF',
      },
      {
        token: 'constant.numeric',
        foreground: '#C084FC',
      },
      {
        token: 'keyword',
        foreground: '#F87171',
      },
      {
        token: 'keyword.operator.assignment',
        foreground: '#94A3B8',
      },
      {
        token: 'storage',
        foreground: '#2DD4BF',
      },
      {
        token: 'entity',
        foreground: '#34D399',
      },
      {
        token: 'entity.name.type',
        foreground: '#38BDF8',
      },
      {
        token: 'variable',
        foreground: '#38BDF8',
      },
      {
        token: 'variable.parameter',
        foreground: '#FDBA74',
      },
      {
        token: 'punctuation',
        foreground: '#94A3B8',
      },
      {
        token: 'punctuation.definition.string',
        foreground: '#FDE68A',
      },
      {
        token: 'punctuation.definition.group.regexp',
        foreground: '#F87171',
      },
      {
        token: 'punctuation.definition.character-class',
        foreground: '#2DD4BF',
      },
      {
        token: 'support',
        foreground: '#2DD4BF',
      },
      {
        token: 'support.class',
        foreground: '#38BDF8',
      },
    ],
  });

  // Define pace light mode theme
  monaco.editor.defineTheme('pace-light', {
    base: 'vs',
    inherit: false,
    colors: {
      'editor.foreground': '#334155',
      'editor.background': '#FFFFFF',
      'editor.selectionBackground': '#CBD5E1',
      'editor.lineHighlightBackground': '#F1F5F9',
      'editorCursor.foreground': '#0F172A',
      'editorHoverWidget.border': '#E2E8F0',
      'editorIndentGuide.background': '#CBD5E1',
      'editorLineNumber.foreground': '#94A3B8',
      'editorLineNumber.activeForeground': '#334155',
      'editorWhitespace.foreground': '#CBD5E1',
      'editorWidget.background': '#F1F5F9',
      'scrollbarSlider.activeBackground': '#94A3B880',
      'scrollbarSlider.background': '#E2E8F080',
      'scrollbarSlider.hoverBackground': '#CBD5E180',
    },
    rules: [
      {
        token: 'comment',
        foreground: '#94A3B8',
      },
      {
        token: 'string',
        foreground: '#CA8A04',
      },
      {
        token: 'string.regex',
        foreground: '#334155',
      },
      {
        token: 'constant',
        foreground: '#0D9488',
      },
      {
        token: 'constant.numeric',
        foreground: '#9333EA',
      },
      {
        token: 'keyword',
        foreground: '#DC2626',
      },
      {
        token: 'keyword.operator.assignment',
        foreground: '#64748B',
      },
      {
        token: 'storage',
        foreground: '#0D9488',
      },
      {
        token: 'entity',
        foreground: '#059669',
      },
      {
        token: 'entity.name.type',
        foreground: '#0284C7',
      },
      {
        token: 'variable',
        foreground: '#0284C7',
      },
      {
        token: 'variable.parameter',
        foreground: '#F97316',
      },
      {
        token: 'punctuation',
        foreground: '#64748B',
      },
      {
        token: 'punctuation.definition.string',
        foreground: '#CA8A04',
      },
      {
        token: 'punctuation.definition.group.regexp',
        foreground: '#DC2626',
      },
      {
        token: 'punctuation.definition.character-class',
        foreground: '#0D9488',
      },
      {
        token: 'support',
        foreground: '#059669',
      },
      {
        token: 'support.class',
        foreground: '#0284C7',
      },
    ],
  });

  // Add Valibot to context of editor
  monaco.typescript.typescriptDefaults.addExtraLib(
    valibotPackageJson,
    'file:///node_modules/valibot/package.json'
  );
  monaco.typescript.typescriptDefaults.addExtraLib(
    valibotTypes,
    'file:///node_modules/valibot/dist/index.d.mts'
  );

  // Add to-json-schema to context of editor
  monaco.typescript.typescriptDefaults.addExtraLib(
    valibotToJsonSchemaPackageJson,
    'file:///node_modules/@valibot/to-json-schema/package.json'
  );
  monaco.typescript.typescriptDefaults.addExtraLib(
    valibotToJsonSchemaTypes,
    'file:///node_modules/@valibot/to-json-schema/dist/index.d.mts'
  );

  // Set TypeScript compiler options
  monaco.typescript.typescriptDefaults.setCompilerOptions({
    strict: true,
    target: monaco.typescript.ScriptTarget.ESNext,
    module: monaco.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
    skipLibCheck: true,
  });
}

// Create initialization promise
let promise: Promise<void> | undefined;

/**
 * Initializes Monaco editor environment.
 */
async function initializeMonaco() {
  if (!promise) {
    promise = setupMonaco();
  }
  await promise;
}
