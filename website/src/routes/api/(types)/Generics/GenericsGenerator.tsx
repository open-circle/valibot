import {
  $,
  component$,
  sync$,
  useComputed$,
  useSignal,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';
import { createHighlighterCoreSync, ThemeRegistrationAny } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import typescript from 'shiki/langs/ts.mjs';
import { Pre } from '~/hooks/useMDXComponents';
import darkTheme from '../../../../../shiki/pace-theme-dark.json';
import lightTheme from '../../../../../shiki/pace-theme-light+.json';
import { generateGeneric } from './generateGeneric';
import './generics.css';

interface GeneratorParameter {
  id: number;
  name: string;
  constraint: string | null;
}

interface GeneratorEditor {
  addConstraint(parameter: GeneratorParameter): Promise<void>;
  parameterBlur(parameter: GeneratorParameter): Promise<void>;
  constraintBlur(parameter: GeneratorParameter): Promise<void>;
}

interface GeneratorState {
  name: string;
  parameters: GeneratorParameter[];
  focus?: { field: string; caret: 'start' | 'end' };
}

const fieldArrowNavigation = sync$(
  (event: KeyboardEvent, element: HTMLInputElement) => {
    if (event.key === ' ') {
      event.preventDefault();
    }
    if (
      (event.shiftKey && event.key !== 'Tab') ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.key !== ' ' && element.selectionStart !== element.selectionEnd)
    ) {
      return;
    }
    const previous =
      (event.key === 'Tab' && event.shiftKey) ||
      (event.key === 'ArrowLeft' && element.selectionStart === 0);
    const next =
      element.dataset.field === 'name' &&
      ((event.key === 'Tab' && !event.shiftKey) ||
        event.key === ' ' ||
        (event.key === 'ArrowRight' &&
          element.selectionEnd === element.value.length));
    if (!previous && !next) return;
    if (next) event.preventDefault();
    const inputs = Array.from(
      element
        .closest('.generics-generator-definition')!
        .querySelectorAll('input')
    );
    const target = inputs[inputs.indexOf(element) + (previous ? -1 : 1)];
    if (target) {
      event.preventDefault();
      target.focus();
      const caret = previous ? target.value.length : 0;
      target.setSelectionRange(caret, caret);
    }
  }
);

const parameterKeyGuard = sync$(
  (event: KeyboardEvent, element: HTMLInputElement) => {
    if (
      (!event.shiftKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        (event.key === 'Tab' ||
          event.key === ' ' ||
          (event.key === 'ArrowRight' &&
            element.selectionStart === element.value.length &&
            element.selectionEnd === element.value.length)) &&
        element.value.trim()) ||
      (event.key === 'Backspace' && !element.value)
    ) {
      event.preventDefault();
    }
  }
);

const constraintKeyGuard = sync$(
  (event: KeyboardEvent, element: HTMLInputElement) => {
    if (
      (!event.shiftKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        (event.key === 'Tab' ||
          event.key === ' ' ||
          (event.key === 'ArrowRight' &&
            element.selectionStart === element.value.length &&
            element.selectionEnd === element.value.length))) ||
      (event.key === 'Backspace' && !element.value)
    ) {
      event.preventDefault();
    }
  }
);

const highlighter = createHighlighterCoreSync({
  langs: [typescript],
  themes: [lightTheme, darkTheme] as ThemeRegistrationAny[],
  engine: createJavaScriptRegexEngine(),
});

/**
 * Generates registrations for the Generics interface.
 */
export const GenericsGenerator = component$(() => {
  const state = useStore<GeneratorState>({
    name: 'WeakMap',
    parameters: [
      { id: 0, name: 'K', constraint: 'object' },
      { id: 1, name: 'V', constraint: null },
    ],
  });
  const editorElement = useSignal<HTMLDivElement>();
  const editor = {
    nameInput: $((value: string) => {
      state.name = value;
    }),
    nameKeyDown: $((event: KeyboardEvent) => {
      if (
        event.defaultPrevented &&
        !event.shiftKey &&
        ['Tab', 'ArrowRight', ' '].includes(event.key) &&
        !state.parameters.length
      ) {
        state.parameters.push({ id: 0, name: 'T1', constraint: null });
        state.focus = { field: 'parameter-0', caret: 'start' };
      }
    }),
    add: $(() => {
      state.parameters.push({
        id:
          Math.max(-1, ...state.parameters.map((parameter) => parameter.id)) +
          1,
        name: `T${state.parameters.length + 1}`,
        constraint: null,
      });
    }),
    parameterInput: $((parameter: GeneratorParameter, value: string) => {
      parameter.name = value;
    }),
    constraintInput: $((parameter: GeneratorParameter, value: string) => {
      parameter.constraint = value;
    }),
    addConstraint: $((parameter: GeneratorParameter) => {
      parameter.constraint ??= '';
      state.focus = { field: `constraint-${parameter.id}`, caret: 'start' };
    }),
    parameterBlur: $((parameter: GeneratorParameter) => {
      if (!parameter.name.trim()) {
        state.parameters = state.parameters.filter(
          (item) => item.id !== parameter.id
        );
      }
    }),
    constraintBlur: $((parameter: GeneratorParameter) => {
      if (!parameter.constraint?.trim()) parameter.constraint = null;
    }),
    parameterKeyDown: $(async function (
      this: GeneratorEditor,
      parameter: GeneratorParameter,
      event: KeyboardEvent
    ) {
      if (
        !event.defaultPrevented ||
        event.shiftKey ||
        !['Tab', 'ArrowRight', ' ', 'Backspace'].includes(event.key)
      ) {
        return;
      }
      if (event.key !== 'Backspace' && parameter.name.trim()) {
        await this.addConstraint(parameter);
      } else if (event.key === 'Backspace' && !parameter.name) {
        const index = state.parameters.findIndex(
          (item) => item.id === parameter.id
        );
        state.focus = {
          field:
            index > 0
              ? `${state.parameters[index - 1].constraint !== null ? 'constraint' : 'parameter'}-${state.parameters[index - 1].id}`
              : 'name',
          caret: 'end',
        };
        await this.parameterBlur(parameter);
      }
    }),
    constraintKeyDown: $(async function (
      this: GeneratorEditor,
      parameter: GeneratorParameter,
      event: KeyboardEvent
    ) {
      if (!event.defaultPrevented || event.shiftKey) return;
      if (['Tab', 'ArrowRight', ' '].includes(event.key)) {
        const index = state.parameters.findIndex(
          (item) => item.id === parameter.id
        );
        let next = state.parameters[index + 1];
        if (!next) {
          next = {
            id: Math.max(-1, ...state.parameters.map((item) => item.id)) + 1,
            name: `T${state.parameters.length + 1}`,
            constraint: null,
          };
          state.parameters.push(next);
        }
        state.focus = { field: `parameter-${next.id}`, caret: 'start' };
      } else if (event.key === 'Backspace' && !parameter.constraint) {
        await this.constraintBlur(parameter);
        state.focus = { field: `parameter-${parameter.id}`, caret: 'end' };
      }
    }),
  };

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const request = track(() => state.focus);
    if (request) {
      const input = editorElement.value?.querySelector<HTMLInputElement>(
        `[data-field="${request.field}"]`
      );
      if (input) {
        input.focus();
        const caret = request.caret === 'end' ? input.value.length : 0;
        input.setSelectionRange(caret, caret);
      }
    }
  });
  const code = useComputed$(() =>
    state.name.trim()
      ? generateGeneric(
          state.name.trim(),
          state.parameters
            .filter((parameter) => parameter.name.trim())
            .map((parameter) => ({
              name: parameter.name,
              constraint: parameter.constraint ?? '',
            }))
        )
      : ''
  );

  const highlightedCode = useComputed$(() =>
    highlighter.codeToHtml(code.value, {
      lang: 'ts',
      themes: { light: 'Pace Light', dark: 'Pace Dark' },
      transformers: [
        {
          root(node) {
            const pre = node.children[0];
            if (pre.type === 'element') {
              const code = pre.children[0];
              if (code.type === 'element') node.children = code.children;
            }
          },
        },
      ],
    })
  );

  return (
    <div class="generics-generator">
      <p>Enter your generic’s name and type parameters:</p>
      <div
        class="generics-generator-definition"
        ref={editorElement}
        role="group"
        aria-label="Generic definition"
      >
        <input
          aria-label="Constructor name"
          data-field="name"
          required
          size={Math.max(1, state.name.length)}
          value={state.name}
          onInput$={(_, element) => editor.nameInput(element.value)}
          onKeyDown$={[
            fieldArrowNavigation,
            $((event: KeyboardEvent) => editor.nameKeyDown(event)),
          ]}
        />
        <span>&lt;</span>
        {state.parameters.map((arg, index) => (
          <span class="generics-generator-argument" key={arg.id}>
            {index > 0 && <span>, </span>}
            <input
              aria-label={`Argument ${index + 1} name`}
              data-field={`parameter-${arg.id}`}
              size={Math.max(1, arg.name.length)}
              value={arg.name}
              onInput$={(_, element) =>
                editor.parameterInput(arg, element.value)
              }
              onKeyDown$={[
                fieldArrowNavigation,
                parameterKeyGuard,
                $((event: KeyboardEvent) =>
                  editor.parameterKeyDown(arg, event)
                ),
              ]}
              onBlur$={() => editor.parameterBlur(arg)}
            />
            {arg.constraint !== null ? (
              <>
                <span class="generics-generator-keyword"> extends </span>
                <input
                  aria-label={`Argument ${index + 1} constraint`}
                  data-field={`constraint-${arg.id}`}
                  size={Math.max(1, arg.constraint.length)}
                  value={arg.constraint}
                  onInput$={(_, element) =>
                    editor.constraintInput(arg, element.value)
                  }
                  onKeyDown$={[
                    fieldArrowNavigation,
                    constraintKeyGuard,
                    $((event: KeyboardEvent) =>
                      editor.constraintKeyDown(arg, event)
                    ),
                  ]}
                  onBlur$={() => editor.constraintBlur(arg)}
                />
              </>
            ) : (
              <button type="button" onClick$={() => editor.addConstraint(arg)}>
                +extends
              </button>
            )}
          </span>
        ))}
        <button
          type="button"
          aria-label="Add argument"
          onClick$={() => editor.add()}
        >
          +
        </button>
        <span>&gt;</span>
      </div>
      <p>
        The code below is generated from your input. Add it to a TypeScript file
        in your project.
      </p>
      {code.value ? (
        <div aria-label="Generated module augmentation">
          <Pre>
            <code dangerouslySetInnerHTML={highlightedCode.value} />
          </Pre>
        </div>
      ) : (
        <p>Enter the constructor name.</p>
      )}
    </div>
  );
});
