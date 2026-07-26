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

export const THEME_KEY = 'theme';

const ThemeContext = createContextId<Signal<Theme>>(THEME_KEY);

/**
 * Provides the theme signal. Mounted once near the root of the app.
 */
export const useThemeProvider = () => {
  const theme = useSignal<Theme>('dark');
  useContextProvider(ThemeContext, theme);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
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

    // Keep the signal and the root class in sync. The inline head script has
    // already applied the class before paint.
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
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.classList.toggle('dark', next === 'dark');
  });
};
