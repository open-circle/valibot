import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import clsx from 'clsx';

type State = 'start' | 'loading' | 'end';

/**
 * Loading animation that gives visual feedback that the route is being changed.
 */
export const RoutingIndicator = component$(() => {
  // Use location and create state signal
  const location = useLocation();
  const state = useSignal<State>('start');

  // Update state when location changes
  useTask$(({ track, cleanup }) => {
    if (track(() => location.isNavigating)) {
      state.value = 'loading';
    } else if (state.value === 'loading') {
      state.value = 'end';
      const timeout = setTimeout(() => (state.value = 'start'), 750);
      cleanup(() => clearTimeout(timeout));
    }
  });

  return (
    <div
      class={clsx(
        'fixed z-50 h-0.5 w-screen origin-left bg-sky-600 md:h-[3px]',
        state.value === 'start' && 'scale-x-0',
        state.value === 'loading' && 'scale-x-75 duration-[3s] ease-linear',
        state.value === 'end' &&
          'opacity-0 [transition:scale_.5s_ease-in,opacity_.5s_linear_.25s]'
      )}
      role="status"
      aria-label={`App is ${location.isNavigating ? '' : 'not'} navigating`}
    />
  );
});
