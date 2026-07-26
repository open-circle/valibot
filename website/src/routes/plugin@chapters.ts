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

export const CHAPTERS_KEY = 'chapters';

/**
 * Class added to `<html>` while chapters are hidden. The docs layout reacts to
 * it via the `no-chapters` Tailwind variant, and an inline script in the
 * document head sets it before first paint to avoid layout shift.
 */
export const CHAPTERS_HIDDEN_CLASS = 'no-chapters';

const ChaptersContext = createContextId<Signal<boolean>>(CHAPTERS_KEY);

/**
 * Provides the chapters signal. Mounted once near the root of the app.
 */
export const useChaptersProvider = () => {
  const chapters = useSignal(true);
  useContextProvider(ChaptersContext, chapters);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    try {
      const stored = localStorage.getItem(CHAPTERS_KEY);
      if (stored === 'true' || stored === 'false') {
        chapters.value = stored === 'true';
      }
    } catch {
      // ignore
    }

    // Keep the signal and the root class in sync. The inline head script has
    // already applied the class before paint.
    document.documentElement.classList.toggle(
      CHAPTERS_HIDDEN_CLASS,
      !chapters.value
    );
  });

  return chapters;
};

/**
 * Returns whether chapters are enabled.
 */
export const useChapters = () => useContext(ChaptersContext);

/**
 * Returns a function that toggles the chapters visibility.
 */
export const useChaptersToggle = (): QRL<() => void> => {
  const chapters = useChapters();
  return $(() => {
    const next = !chapters.value;
    chapters.value = next;
    try {
      localStorage.setItem(CHAPTERS_KEY, String(next));
    } catch {
      // ignore
    }
    document.documentElement.classList.toggle(CHAPTERS_HIDDEN_CLASS, !next);
  });
};
