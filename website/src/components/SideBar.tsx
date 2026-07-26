import {
  $,
  component$,
  type Signal,
  Slot,
  useSignal,
  useTask$,
} from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import clsx from 'clsx';
import { useFocusTrap } from '~/hooks';
import { AngleUpIcon } from '~/icons';

/**
 * Returns a signal that controls the open state of the side bar.
 */
export const useSideBarToggle = () => useSignal(false);

interface SideBarProps {
  ref?: Signal<HTMLElement | undefined>;
  class?: string;
  toggle: ReturnType<typeof useSideBarToggle>;
}

/**
 * Sidebar that can be extended from the bottom on smaller devices and
 * displayed on the side next to the main content on larger ones.
 */
export const SideBar = component$<SideBarProps>(({ ref, toggle, ...props }) => {
  // Use location and element signal
  const location = useLocation();
  const element = useSignal<HTMLElement>();

  // Use focus trap for sidebar
  useFocusTrap(element, toggle);

  // Close side bar when location pathname changes
  useTask$(({ track }) => {
    track(() => location.prevUrl);
    if (
      toggle.value &&
      location.prevUrl &&
      location.url.pathname !== location.prevUrl.pathname
    ) {
      toggle.value = false;
    }
  });

  /**
   * Closes the side bar when the window width is changed to desktop.
   */
  const handleResize = $(() => {
    if (window.innerWidth >= 1024) {
      toggle.value = false;
    }
  });

  return (
    <aside
      class={clsx(
        'sticky bottom-0 h-14 md:h-16 lg:top-[70px] lg:h-auto',
        toggle.value ? 'z-30' : 'z-10',
        props.class
      )}
      ref={(element_) => {
        if (ref) ref.value = element_;
        element.value = element_;
      }}
      window:onResize$={handleResize}
    >
      {/* Content */}
      <div
        class={clsx(
          'flex h-full items-center justify-end border-t-2 border-t-slate-200 backdrop-blur duration-200 lg:items-start lg:border-none dark:border-t-slate-800',
          toggle.value
            ? 'bg-white dark:bg-gray-900'
            : 'bg-white/90 dark:bg-gray-900/90'
        )}
        id="side-bar"
      >
        {/* Buttons */}
        <Slot name="buttons" />

        {/* Toggle */}
        <button
          class="focus-ring m-1 box-content flex h-5 w-5 justify-center rounded-xl p-2.5 hover:text-slate-900 md:h-6 md:w-6 lg:hidden dark:hover:text-slate-200"
          aria-expanded={toggle.value}
          aria-label={`${toggle.value ? 'Close' : 'Open'} side bar`}
          aria-controls="side-bar"
          onClick$={() => {
            toggle.value = !toggle.value;
          }}
        >
          <AngleUpIcon
            class={clsx('h-full duration-200', toggle.value && '-rotate-180')}
          />
        </button>

        {/* Children */}
        <div
          class={clsx(
            'absolute bottom-full h-[60vh] w-full origin-bottom border-t-2 border-t-slate-200 bg-white duration-200 lg:static lg:h-full lg:w-full lg:translate-y-0 lg:border-none dark:border-t-slate-800 dark:bg-gray-900',
            !toggle.value && 'invisible scale-y-0 lg:visible lg:scale-y-100'
          )}
        >
          <Slot />
        </div>

        {/* Gradient overlay */}
        <div
          class={clsx(
            'pointer-events-none absolute bottom-14 z-20 h-14 w-full origin-bottom translate-y-0.5 bg-linear-to-b from-transparent to-white duration-300 md:bottom-16 lg:hidden dark:to-gray-900',
            !toggle.value && 'invisible scale-y-0'
          )}
        />
      </div>

      {/* Background overlay */}
      <div
        class={clsx(
          'absolute bottom-0 -z-10 h-screen w-full bg-black/10 lg:hidden dark:bg-black/20',
          toggle.value ? 'duration-300' : 'invisible opacity-0 duration-75'
        )}
        onClick$={() => {
          toggle.value = false;
        }}
      />
    </aside>
  );
});
