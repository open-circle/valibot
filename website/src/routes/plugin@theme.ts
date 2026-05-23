import {
  $,
  createContextId,
  type QRL,
  type Signal,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik';

type Theme = 'dark' | 'light';

const ThemeContext = createContextId<Signal<Theme>>('theme');

/**
 * Provides the theme signal. Mounted once near the root of the app.
 */
export const useThemeProvider = () => {
  const theme = useSignal<Theme>('dark');
  useContextProvider(ThemeContext, theme);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        theme.value = stored;
      } else if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches
      ) {
        theme.value = 'light';
      }
    } catch {
      // ignore
    }
    document.documentElement.classList.toggle('dark', theme.value === 'dark');
  });

  return theme;
};

/**
 * Returns the current theme.
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * Returns a function that toggles the theme.
 */
export const useThemeToggle = (): QRL<() => void> => {
  const theme = useTheme();
  return $(() => {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark';
    theme.value = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // ignore
    }
    document.documentElement.classList.toggle('dark', next === 'dark');
  });
};
