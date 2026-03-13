import {
  component$,
  useComputed$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from '@builder.io/qwik';
import { useContent } from '@builder.io/qwik-city';
import clsx from 'clsx';

/**
 * Navigation list used to display the current page's content structure.
 */
export const Chapters = component$(() => {
  // Use content and active ID signal
  const content = useContent();
  const activeId = useSignal<string>();

  // Use list element and indicator style signal
  const listElement = useSignal<HTMLUListElement>();
  const indicatorStyle = useSignal<{
    top: string;
    height: string;
  }>();

  // Compute filtererd level 2 headings
  const headings = useComputed$(
    () =>
      // Use level 2 headings for subpages
      content.headings?.filter((heading) => heading.level === 2) ||
      // Or use main menu items for top level pages
      content.menu?.items?.map((heading) => ({
        text: heading.text,
        id: heading.text.toLowerCase(),
      })) ||
      []
  );

  // Reset active ID when headings change
  useTask$(({ track }) => {
    track(headings);
    activeId.value = undefined;
  });

  // Update active ID when heading is intersecting
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    // Update observer when headings change
    track(headings);

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Check every intersection entry
        for (let index = 0; index < entries.length; index++) {
          const entry = entries[index];

          // Mark first visible heading or last heading that is above viewport
          // as active
          if (
            entry.isIntersecting ||
            (index > 0 &&
              index === entries.length - 1 &&
              entry.boundingClientRect.top < 0)
          ) {
            activeId.value = entry.target.id;
            break;
          }

          // Mark previous heading of first heading below intersection
          // bounding box, if any, as active
          if (entry.boundingClientRect.top > 0) {
            activeId.value =
              headings.value[
                headings.value.findIndex(
                  (heading) => heading.id === entry.target.id
                ) - 1
              ]?.id;
            break;
          }
        }
      },

      // Observe only top 30% of window
      { rootMargin: '0px 0px -70% 0px' }
    );

    // Observe every heading element
    headings.value.forEach((heading) =>
      observer.observe(document.getElementById(heading.id)!)
    );

    // Disconnect observer on cleanup
    cleanup(() => observer.disconnect());
  });

  // Update indicator style when active ID changes
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(activeId);

    // Get active list element by pathname and href
    const activeElement = [...listElement.value!.children].find((e) =>
      (e.children[0] as HTMLAnchorElement).href.endsWith(`#${activeId.value}`)
    ) as HTMLLIElement | undefined;

    // Update indicator style to active element or reset it to undefined
    indicatorStyle.value = activeElement
      ? {
          top: `${activeElement.offsetTop}px`,
          height: `${activeElement.offsetHeight}px`,
        }
      : undefined;
  });

  return (
    <nav class="sticky top-32 flex flex-col gap-6">
      <h5 class="text-lg font-medium text-slate-900 dark:text-slate-200">
        On this page
      </h5>
      <div class="relative">
        <ul
          class="flex flex-col gap-5 border-l-2 border-l-slate-200 dark:border-l-slate-800"
          ref={listElement}
        >
          {headings.value.map(({ text, id }) => (
            <li key={id}>
              <a
                class={clsx(
                  'focus-ring relative -left-0.5 block truncate border-l-2 border-l-transparent pl-4 transition-colors hover:border-l-slate-400 focus-visible:rounded-md hover:dark:border-l-slate-600',
                  activeId.value === id
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'hover:text-slate-800 dark:hover:text-slate-300'
                )}
                href={`#${id}`}
                preventdefault:click
                onClick$={() =>
                  document.getElementById(id)!.scrollIntoView({
                    behavior: 'smooth',
                  })
                }
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
        <div
          class="absolute m-0 w-0.5 rounded bg-sky-600 duration-200 dark:bg-sky-400"
          style={indicatorStyle.value}
        />
      </div>
    </nav>
  );
});
