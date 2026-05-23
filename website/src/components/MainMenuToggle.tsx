import { component$, type Signal } from '@builder.io/qwik';
import clsx from 'clsx';

type MainMenuToggleProps = {
  toggle: Signal<boolean>;
};

/**
 * Button for opening and closing the main menu. Depending on the status, a
 * hamburger or close icon is displayed.
 */
export const MainMenuToggle = component$<MainMenuToggleProps>(({ toggle }) => (
  <button
    class={clsx(
      'focus-ring group/button rounded-lg p-2',
      !toggle.value && 'rotate-180'
    )}
    type="button"
    aria-expanded={toggle.value}
    aria-label={`${toggle.value ? 'Close' : 'Open'} main menu`}
    aria-controls="main-menu"
    onClick$={() => {
      toggle.value = !toggle.value;
    }}
  >
    <span class="relative flex h-5 w-5 items-center justify-center md:h-[22px] md:w-[22px]">
      {[...Array(3).keys()].map((index) => (
        <span
          key={index}
          class={clsx(
            'absolute h-[1.5px] w-full rounded-full bg-slate-600 transition group-hover/button:bg-slate-900 dark:bg-slate-400 dark:group-hover/button:bg-slate-200',
            index === 1 && toggle.value && 'opacity-0',
            index === 0 && (toggle.value ? '-rotate-45' : '-translate-y-1.5'),
            index === 2 && (toggle.value ? 'rotate-45' : 'translate-y-1.5')
          )}
        />
      ))}
    </span>
  </button>
));
