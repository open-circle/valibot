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

const ChaptersContext = createContextId<Signal<boolean>>('chapters');

/**
 * Provides the chapters signal. Mounted once near the root of the app.
 */
export const useChaptersProvider = () => {
  const chapters = useSignal(true);
  useContextProvider(ChaptersContext, chapters);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    try {
      const stored = localStorage.getItem('chapters');
      if (stored === 'true' || stored === 'false') {
        chapters.value = stored === 'true';
      }
    } catch {
      // ignore
    }
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
      localStorage.setItem('chapters', String(next));
    } catch {
      // ignore
    }
  });
};
