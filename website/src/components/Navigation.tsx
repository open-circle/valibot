import {
  component$,
  type ReadonlySignal,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik';
import {
  type ContentMenu,
  Link,
  useContent,
  useLocation,
} from '@builder.io/qwik-city';
import clsx from 'clsx';

type NavigationProps = {
  class?: string;
};

/**
 * Navigation list used as a secondary navigation over a certain part of the
 * website.
 */
export const Navigation = component$<NavigationProps>((props) => {
  // Use content and nav element signal
  const content = useContent();
  const navElement = useSignal<HTMLElement>();

  return (
    <nav
      ref={navElement}
      class={clsx('h-full overflow-auto overscroll-contain', props.class)}
    >
      <ul class="flex flex-col gap-9 lg:gap-12">
        {content.menu?.items?.map((item) => (
          <NavItem {...item} navElement={navElement} key={item.text} />
        ))}
      </ul>
    </nav>
  );
});

export type NavItemProps = {
  navElement: ReadonlySignal<HTMLElement | undefined>;
  text: string;
  items?: ContentMenu[];
};

/**
 * Single navigation main point that displays a heading and a navigation list.
 */
const NavItem = component$<NavItemProps>(({ navElement, text, items }) => {
  // Use location
  const location = useLocation();

  // Use list element and indicator style signal
  const listElement = useSignal<HTMLUListElement>();
  const indicatorStyle = useSignal<{
    top: string;
    height: string;
  }>();

  // Update indicator style when pathname changes
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ track }) => {
      // Track URL pathname
      const pathname = track(() => location.url.pathname);

      // Get active list element by pathname and href
      const activeElement = [...listElement.value!.children].find((e) =>
        (e.children[0] as HTMLAnchorElement).href.endsWith(pathname)
      ) as HTMLLIElement | undefined;

      // Update indicator style to active element or reset it to undefined
      indicatorStyle.value = activeElement
        ? {
            top: `${activeElement.offsetTop}px`,
            height: `${activeElement.offsetHeight}px`,
          }
        : undefined;

      // Scroll active element into view if needed
      if (activeElement) {
        setTimeout(
          () => {
            const parentClientRect = navElement.value!.getBoundingClientRect();
            if (parentClientRect.height > 0) {
              const childClientRect = activeElement.getBoundingClientRect();
              if (
                childClientRect.top < parentClientRect.top ||
                childClientRect.bottom > parentClientRect.bottom
              ) {
                navElement.value!.scrollBy({
                  behavior: 'smooth',
                  top:
                    childClientRect.top -
                    parentClientRect.top -
                    parentClientRect.height / 2 +
                    childClientRect.height,
                });
              }
            }
          },
          window.innerWidth < 1024 ? 100 : 0
        );
      }
    },
    { strategy: 'document-idle' }
  );

  return (
    <li class="flex flex-col gap-6">
      <div class="sticky -top-1 z-10 lg:-top-24">
        <h4
          class={clsx(
            'text-lg font-medium text-slate-900 dark:text-slate-200',
            items?.some(({ href }) => location.url.pathname === href) &&
              'docsearch-lvl1'
          )}
        >
          {text}
        </h4>
        <div class="pointer-events-none absolute -top-8 -z-10 h-24 w-full bg-linear-to-b from-white via-white to-transparent opacity-90 dark:from-gray-900 dark:via-gray-900" />
      </div>
      <div class="relative">
        <ul
          class="flex flex-col gap-5 border-l-2 border-l-slate-200 dark:border-l-slate-800"
          ref={listElement}
        >
          {items?.map(({ text, href }) => (
            <li key={href}>
              <Link
                class={clsx(
                  'focus-ring relative -left-0.5 block truncate border-l-2 border-l-transparent pl-4 transition-colors hover:border-l-slate-400 focus-visible:rounded-md hover:dark:border-l-slate-600',
                  location.url.pathname === href
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'hover:text-slate-800 dark:hover:text-slate-300'
                )}
                href={href}
                prefetch={false}
              >
                {text}
              </Link>
            </li>
          ))}
        </ul>
        <div
          class="absolute m-0 w-0.5 rounded bg-sky-600 duration-200 dark:bg-sky-400"
          style={indicatorStyle.value}
        />
      </div>
    </li>
  );
});
