import {
  $,
  component$,
  type Signal,
  useComputed$,
  useSignal,
  useTask$,
} from '@builder.io/qwik';
import {
  globalAction$,
  Link,
  useLocation,
  z,
  zod$,
} from '@builder.io/qwik-city';
import clsx from 'clsx';
import { useFocusTrap } from '~/hooks';
import { LogoIcon } from '~/icons';
import { DiscordIconLink } from './DiscordIconLink';
import { GitHubIconLink } from './GitHubIconLink';
import { MainMenuToggle } from './MainMenuToggle';
import { SearchToggle } from './SearchToggle';
import { ThemeToggle } from './ThemeToggle';

/**
 * Toggles the open state of the main menu.
 */
export const useMainMenuToggle = globalAction$(
  (values) => values,
  zod$({ state: z.enum(['opened', 'closed']) })
);

type HeaderProps = {
  searchOpen: Signal<boolean>;
};

/**
 * Fixed header with logo, main navigation and theme toogle.
 */
export const Header = component$<HeaderProps>(({ searchOpen }) => {
  // Use location, root element and scrolled signal
  const location = useLocation();
  const rootElement = useSignal<HTMLElement>();
  const windowScrolled = useSignal(false);

  // Use main menu toggle and compute open state
  const toggle = useMainMenuToggle();
  const isOpen = useComputed$(() =>
    toggle.isRunning
      ? // Optimistic UI
        toggle.formData?.get('state') === 'opened'
      : toggle.value?.state === 'opened'
  );

  // Use focus trap for main menu
  useFocusTrap(rootElement, isOpen);

  // Close main menu when location pathname changes
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
   * Updates the window scrolled state.
   */
  const updateWindowScrolled = $(() => {
    windowScrolled.value = window.scrollY > 0;
  });

  return (
    <header
      class={clsx(
        'sticky top-0 h-14 md:h-16 lg:h-[70px]',
        isOpen.value ? 'z-30' : 'z-20'
      )}
      ref={rootElement}
      window:onScroll$={updateWindowScrolled}
    >
      {/* Header content */}
      <div
        class={clsx(
          'flex h-full items-center justify-between border-b-2 px-2 backdrop-blur duration-200 lg:px-4',
          isOpen.value && 'bg-white dark:bg-gray-900',
          !isOpen.value && windowScrolled.value
            ? 'border-b-slate-200 bg-white/90 dark:border-b-slate-800 dark:bg-gray-900/90'
            : 'border-b-transparent'
        )}
      >
        {/* Website logo */}
        <div class="-m-1 overflow-hidden p-1 lg:w-64">
          <Link
            class="focus-ring inline-flex w-full items-center rounded-lg p-2 font-medium transition-colors select-none hover:text-slate-900 md:w-auto md:text-lg lg:text-xl dark:hover:text-slate-200"
            href="/"
            prefetch={false}
            preventdefault:contextmenu
            onContextMenu$={() =>
              window.open(
                'https://github.com/open-circle/valibot/tree/main/brand'
              )
            }
          >
            <LogoIcon class="mr-2 h-8 shrink-0 md:h-9 lg:mr-3 lg:h-10" />
            <div class="font-lexend-exa truncate text-lg font-medium md:text-xl lg:text-2xl">
              {/* The `<span />` is necessary because Safari will not display the text overflow ellipsis if the text color of the hidden element is transparent */}
              <span class="bg-linear-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400">
                Valibot
              </span>
            </div>
          </Link>
        </div>

        {/* Icon buttons (mobile) */}
        <div class="flex items-center gap-4 lg:hidden">
          <DiscordIconLink />
          <GitHubIconLink />
          <ThemeToggle />
          <SearchToggle open={searchOpen} />
          <MainMenuToggle action={toggle} open={isOpen.value} />
        </div>

        {/* Main menu */}
        <nav
          class={clsx(
            'absolute top-full left-0 flex max-h-[60vh] w-full origin-top flex-col overflow-y-auto border-b-2 pt-4 pb-8 duration-200 lg:static lg:top-auto lg:w-auto lg:translate-y-0 lg:flex-row lg:gap-5 lg:overflow-visible lg:border-none lg:bg-transparent lg:p-0 xl:gap-6 lg:dark:bg-transparent',
            !isOpen.value && 'invisible scale-y-0 lg:visible lg:scale-y-100',
            (isOpen.value && 'bg-white dark:bg-gray-900') ||
              (windowScrolled.value && 'bg-white/90 dark:bg-gray-900/90'),
            isOpen.value || windowScrolled.value
              ? 'border-b-slate-200 dark:border-b-slate-800'
              : 'border-b-transparent'
          )}
          id="main-menu"
        >
          {[
            { label: 'Guides', href: '/guides/' },
            { label: 'API', href: '/api/' },
            { label: 'Blog', href: '/blog/' },
            { label: 'Playground', href: '/playground/' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              class={clsx(
                'focus-ring mx-4 rounded-lg px-4 py-3 text-lg transition-colors hover:text-slate-900 lg:px-3 lg:py-2 lg:text-[17px] lg:font-medium dark:hover:text-slate-200',
                location.url.pathname.startsWith(href) &&
                  'docsearch-lvl0 text-slate-900 dark:text-slate-200'
              )}
              href={href}
              prefetch={false}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Icon buttons (desktop) */}
        <div class="hidden lg:flex lg:w-64 lg:items-center lg:justify-end lg:gap-6">
          <SearchToggle open={searchOpen} />
          <ThemeToggle />
          <div
            class="lg:block lg:h-5 lg:w-0.5 lg:rounded-full lg:bg-slate-200 lg:dark:bg-slate-800"
            role="separator"
          />
          <GitHubIconLink />
          <DiscordIconLink />
        </div>
      </div>

      {/* Background overlay */}
      <div
        class={clsx(
          'absolute top-0 -z-10 h-screen w-full bg-black/10 lg:hidden dark:bg-black/20',
          isOpen.value
            ? 'delay-75 duration-300'
            : 'invisible opacity-0 duration-75'
        )}
        onClick$={() => toggle.submit({ state: 'closed' })}
      />
    </header>
  );
});
