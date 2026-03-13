import {
  $,
  component$,
  type Signal,
  Slot,
  useComputed$,
  useSignal,
  useTask$,
} from '@builder.io/qwik';
import {
  Form,
  globalAction$,
  useLocation,
  z,
  zod$,
} from '@builder.io/qwik-city';
import clsx from 'clsx';
import { useFocusTrap } from '~/hooks';
import { AngleUpIcon } from '~/icons';

/**
 * Toggles the open state of the side bar.
 */
export const useSideBarToggle = globalAction$(
  (values) => values,
  zod$({ state: z.enum(['opened', 'closed']) })
);

type SideBarProps = {
  ref?: Signal<HTMLElement | undefined>;
  class?: string;
  toggle: ReturnType<typeof useSideBarToggle>;
};

/**
 * Sidebar that can be extended from the bottom on smaller devices and
 * displayed on the side next to the main content on larger ones.
 */
export const SideBar = component$<SideBarProps>(({ ref, toggle, ...props }) => {
  // Use location and element signal
  const location = useLocation();
  const element = useSignal<HTMLElement>();

  // Use computed open state
  const isOpen = useComputed$(() =>
    toggle.isRunning
      ? // Optimistic UI
        toggle.formData?.get('state') === 'opened'
      : toggle.value?.state === 'opened'
  );

  // Use focus trap for sidebar
  useFocusTrap(element, isOpen);

  // Close side bar when location pathname changes
  useTask$(({ track }) => {
    track(() => location.prevUrl);
    if (
      isOpen.value &&
      location.prevUrl &&
      location.url.pathname !== location.prevUrl.pathname
    ) {
      toggle.submit({ state: 'closed' });
    }
  });

  /**
   * Closes the side bar when the window width is changed to desktop.
   */
  const handleResize = $(() => {
    if (window.innerWidth >= 1024) {
      toggle.submit({ state: 'closed' });
    }
  });

  return (
    <aside
      class={clsx(
        'sticky bottom-0 h-14 md:h-16 lg:top-[70px] lg:h-auto',
        isOpen.value ? 'z-30' : 'z-10',
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
          isOpen.value
            ? 'bg-white dark:bg-gray-900'
            : 'bg-white/90 dark:bg-gray-900/90'
        )}
        id="side-bar"
      >
        {/* Buttons */}
        <Slot name="buttons" />

        {/* Toggle */}
        <Form class="lg:hidden" action={toggle}>
          <input
            type="hidden"
            name="state"
            value={isOpen.value ? 'closed' : 'opened'}
          />
          <button
            class="focus-ring m-1 box-content flex h-5 w-5 justify-center rounded-xl p-2.5 hover:text-slate-900 md:h-6 md:w-6 dark:hover:text-slate-200"
            aria-expanded={isOpen.value}
            aria-label={`${isOpen.value ? 'Close' : 'Open'} side bar`}
            aria-controls="side-bar"
          >
            <AngleUpIcon
              class={clsx('h-full duration-200', isOpen.value && '-rotate-180')}
            />
          </button>
        </Form>

        {/* Children */}
        <div
          class={clsx(
            'absolute bottom-full h-[60vh] w-full origin-bottom border-t-2 border-t-slate-200 bg-white duration-200 lg:static lg:h-full lg:w-full lg:translate-y-0 lg:border-none dark:border-t-slate-800 dark:bg-gray-900',
            !isOpen.value && 'invisible scale-y-0 lg:visible lg:scale-y-100'
          )}
        >
          <Slot />
        </div>

        {/* Gradient overlay */}
        <div
          class={clsx(
            'pointer-events-none absolute bottom-14 z-20 h-14 w-full origin-bottom translate-y-0.5 bg-linear-to-b from-transparent to-white duration-300 md:bottom-16 lg:hidden dark:to-gray-900',
            !isOpen.value && 'invisible scale-y-0'
          )}
        />
      </div>

      {/* Background overlay */}
      <div
        class={clsx(
          'absolute bottom-0 -z-10 h-screen w-full bg-black/10 lg:hidden dark:bg-black/20',
          isOpen.value ? 'duration-300' : 'invisible opacity-0 duration-75'
        )}
        onClick$={() => toggle.submit({ state: 'closed' })}
      />
    </aside>
  );
});
