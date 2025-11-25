import {
  $,
  component$,
  type Signal,
  sync$,
  useComputed$,
  useSignal,
  useTask$,
} from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { isBrowser } from '@builder.io/qwik/build';
import clsx from 'clsx';
import { useFocusTrap, useStorageSignal } from '~/hooks';
import {
  AngleRightIcon,
  CloseIcon,
  HashtagIcon,
  PageIcon,
  SearchIcon,
} from '~/icons';
import { AlgoliaLogo } from '~/logos';
import { trackEvent } from '~/utils';
import { Link } from './Link';
import { SystemIcon } from './SystemIcon';
import { TextLink } from './TextLink';

type HitType = 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'content';

type AlgoliaResult = {
  hits: {
    type: HitType;
    hierarchy: {
      lvl0: string;
      lvl1: string;
      lvl2: string;
      lvl3: string | null;
      lvl4: string | null;
    };
    content: string | null;
    url: string;
    _highlightResult: {
      hierarchy: {
        lvl0: { value: string };
        lvl1: { value: string };
        lvl2: { value: string };
        lvl3: { value: string } | undefined;
        lvl4: { value: string } | undefined;
        lvl5: { value: string } | undefined;
      };
    };
    _snippetResult?: {
      content: { value: string };
    };
  }[];
};

type SearchItem = {
  group: string;
  relation: 'page' | 'child' | 'none';
  type: HitType;
  page: string;
  text: string;
  path: string;
};

type SearchStorage = {
  [key: string]:
    | {
        result: SearchItem[];
        expires: number;
      }
    | undefined;
};

type DocSearchProps = {
  open: Signal<boolean>;
};

/**
 * Provides a search box for the documentation.
 */
export const DocSearch = component$<DocSearchProps>(({ open }) => {
  // Use location and navigate
  const location = useLocation();
  const navigate = useNavigate();

  // Use input, loading, active index and error signal
  const input = useSignal('');
  const loading = useSignal(false);
  const activeIndex = useSignal(0);
  const error = useSignal(false);

  // Use modal and input element signal
  const modalElement = useSignal<HTMLDivElement>();
  const inputElement = useSignal<HTMLInputElement>();

  // Use storage, recent, result and clicked signal
  const storage = useStorageSignal<SearchStorage>('search-index', {});
  const recent = useStorageSignal<SearchItem[]>('search-recent', []);
  const result = useSignal<SearchItem[]>([]);
  const clicked = useSignal<SearchItem | null>(null);

  // Compute search items
  const searchItems = useComputed$(() =>
    input.value ? result.value : recent.value
  );

  // Use focus trap when search is open
  useFocusTrap(modalElement, open);

  // Do stuff when search is opened or closed
  useTask$(({ track }) => {
    track(inputElement);
    track(open);
    if (isBrowser && inputElement.value) {
      // Focus input and block background scrolling when search is opened
      if (open.value) {
        inputElement.value.focus();
        document.body.style.overflow = 'hidden';

        // Tracke open search event
        trackEvent('open_search');

        // Otherwise when search is closed, add clicked item to recent and
        // reset state and background scrolling
      } else {
        const item = clicked.value;
        if (item) {
          recent.value = [
            item,
            ...recent.value.filter((i) => i !== item).slice(0, 5),
          ];

          // Track seleact search item event
          trackEvent('select_search_item', {
            input: input.value,
            path: item.path,
          });
        }

        // Reset state and background scrolling
        input.value = '';
        activeIndex.value = 0;
        result.value = [];
        clicked.value = null;
        document.body.style.overflow = '';
      }
    }
  });

  // Close search when location changes
  useTask$(({ track }) => {
    track(() => location.prevUrl);
    if (isBrowser) {
      open.value = false;
    }
  });

  // Update search result and active index when input changes
  useTask$(({ track, cleanup }) => {
    const currentInput = track(input);
    if (isBrowser) {
      // Reset error state
      error.value = false;

      // If input is present, query and set search result
      if (currentInput) {
        // Get its current value
        const storageValue = storage.value[currentInput];

        // Set result of index values is present and not expired
        if (storageValue && storageValue.expires >= Date.now()) {
          activeIndex.value = storageValue.result.length ? 0 : -1;
          result.value = storageValue.result;
          loading.value = false;

          // Otherwise query search result from Algolia with a short timeout to
          // reduce unnecessary queries
        } else {
          const timeout = setTimeout(async () => {
            try {
              const algoliaResult = (await (
                await fetch(
                  `https://${
                    import.meta.env.PUBLIC_ALGOLIA_APP_ID
                  }-dsn.algolia.net/1/indexes/${
                    import.meta.env.PUBLIC_ALGOLIA_INDEX_NAME
                  }/query`,
                  {
                    method: 'POST',
                    headers: {
                      'X-Algolia-Application-Id': import.meta.env
                        .PUBLIC_ALGOLIA_APP_ID,
                      'X-Algolia-API-Key': import.meta.env
                        .PUBLIC_ALGOLIA_PUBLIC_API_KEY,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      query: currentInput,
                      filters: 'NOT type:lvl1',
                    }),
                  }
                )
              ).json()) as AlgoliaResult;

              // Transform hits of Algolia result to our schema
              let prevItem: SearchItem | undefined;
              const searchResult: SearchItem[] = algoliaResult.hits.map(
                (hit) => {
                  // Create path by removing origin from URL
                  const path = hit.url.replace(
                    import.meta.env.PUBLIC_WEBSITE_URL,
                    ''
                  );

                  // Create search item object
                  const searchItem: SearchItem = {
                    group: `${hit.hierarchy.lvl0}${hit.hierarchy.lvl1 ? `: ${hit.hierarchy.lvl1}` : ''}`,
                    relation:
                      hit.type === 'lvl2'
                        ? 'page'
                        : prevItem &&
                            prevItem.relation !== 'none' &&
                            prevItem.path.split('#')[0] === path.split('#')[0]
                          ? 'child'
                          : 'none',
                    type: hit.type,
                    page: hit._highlightResult.hierarchy.lvl2.value,
                    text:
                      hit.type === 'content'
                        ? hit._snippetResult!.content.value
                        : hit._highlightResult.hierarchy[hit.type]!.value,
                    path,
                  };

                  // Update previous item variable
                  prevItem = searchItem;

                  // Return search item object
                  return searchItem;
                }
              );

              // Add search result to search storage
              storage.value = {
                ...storage.value,
                [currentInput]: {
                  result: searchResult,
                  expires: Date.now() + 6.048e8, // 7 days
                },
              };

              // Set search result if input has not changed
              if (currentInput === input.value) {
                activeIndex.value = 0;
                result.value = searchResult;
                loading.value = false;
              }

              // Update state in case of an error
            } catch {
              error.value = true;
            }
          }, 150);

          // Set loading to "true"
          loading.value = true;

          // Clear timeout if the input has changed in the meantime
          cleanup(() => clearTimeout(timeout));
        }

        // Otherwise if input is empty, reset state
      } else {
        activeIndex.value = 0;
        result.value = [];
        loading.value = false;
      }
    }
  });

  /**
   * Handles the click on a search item.
   */
  const handleClick = $((item: SearchItem) => {
    if (item.path === location.url.pathname) {
      open.value = false;
    }
    clicked.value = item;
  });

  /**
   * Handles keyboard keydown events.
   */
  const handleKeyDown = $((event: KeyboardEvent) => {
    // Open or close search
    if (
      ((event.ctrlKey || event.metaKey) && event.key === 'k') ||
      (open.value && event.key === 'Escape')
    ) {
      open.value = !open.value;
    }

    if (open.value) {
      // Change active index
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        const maxIndex = searchItems.value.length - 1;
        activeIndex.value =
          event.key === 'ArrowUp'
            ? activeIndex.value === 0
              ? maxIndex
              : activeIndex.value - 1
            : activeIndex.value === maxIndex
              ? 0
              : activeIndex.value + 1;
      }

      // Select current active index
      if (event.key === 'Enter') {
        const item = searchItems.value[activeIndex.value];

        if (item) {
          if (item.path === location.url.pathname) {
            open.value = false;
          } else {
            navigate(item.path);
          }
          clicked.value = item;
        }
      }
    }
  });

  /**
   * Prevents default behavior of keydown events.
   */
  const preventDefault = sync$((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
    }
  });

  return (
    <div
      class={clsx(
        open.value &&
          'fixed top-0 left-0 z-40 h-screen w-screen lg:p-40 xl:p-48'
      )}
      window:onKeyDown$={[preventDefault, handleKeyDown]}
    >
      {open.value && (
        <>
          <div
            class="flex h-full w-full flex-col bg-white/90 backdrop-blur-sm lg:mx-auto lg:h-auto lg:max-h-full lg:max-w-3xl lg:rounded-3xl lg:bg-white lg:backdrop-blur-none dark:bg-gray-900/90 lg:dark:bg-gray-900"
            ref={modalElement}
          >
            {/* Header */}
            <header class="flex h-14 shrink-0 items-center px-2 md:h-16 lg:h-[72px] lg:px-4">
              <form class="flex flex-1" preventdefault:submit>
                <SystemIcon
                  label={loading.value ? 'Search' : 'Focus search input'}
                  type="button"
                  onClick$={() => inputElement.value!.focus()}
                  loading={loading.value}
                >
                  <SearchIcon class="h-full" />
                </SystemIcon>
                <input
                  class="flex-1 bg-transparent px-2 text-lg text-slate-900 outline-none placeholder:text-slate-500 md:text-xl dark:text-slate-200"
                  ref={inputElement}
                  name="search"
                  type="search"
                  placeholder="Search docs"
                  value={input.value}
                  onInput$={(_, element) => (input.value = element.value)}
                />
              </form>
              <SystemIcon
                class="lg:h-[22px]! lg:w-[22px]!"
                label="Close search"
                type="button"
                onClick$={() => (open.value = false)}
              >
                <CloseIcon class="h-full" />
              </SystemIcon>
            </header>

            {/* Content */}
            <div class="flex-1 overflow-y-auto overscroll-contain scroll-smooth p-4 lg:min-h-[120px] lg:px-6">
              {
                // Error
                error.value ? (
                  <p class="md:text-lg">
                    An unexpected error has occurred. If this happens regularly,
                    please create an{' '}
                    <TextLink
                      href="https://github.com/open-circle/valibot/issues/new"
                      target="_blank"
                      colored
                      underlined
                    >
                      issue
                    </TextLink>{' '}
                    on Github.
                  </p>
                ) : // No result
                input.value && !loading.value && !result.value.length ? (
                  <p class="text-sm md:text-base">
                    No results for "
                    <span class="text-slate-900 dark:text-slate-200">
                      {input.value}
                    </span>
                    "
                  </p>
                ) : // Result
                input.value && result.value.length ? (
                  <ul>
                    {result.value.map((item, index) => {
                      const getPrevItem = () =>
                        index > 0 ? result.value[index - 1] : undefined;
                      const getGroup = () =>
                        getPrevItem()?.group !== item.group
                          ? item.group
                          : undefined;
                      return (
                        <li
                          key={item.path + item.text}
                          class={clsx(
                            index > 0 &&
                              (getGroup()
                                ? 'mt-9'
                                : item.relation === 'page' &&
                                    getPrevItem()?.relation !== 'page'
                                  ? 'mt-6'
                                  : item.relation === 'child'
                                    ? 'border-l-2 border-l-slate-200 pt-2.5 pl-2 dark:border-l-slate-800'
                                    : 'mt-2.5')
                          )}
                        >
                          {getGroup() && (
                            <div class="mb-6 text-sm md:text-base">
                              {getGroup()}
                            </div>
                          )}
                          <SearchItem
                            {...item}
                            index={index}
                            activeIndex={activeIndex}
                            onClick$={() => handleClick(item)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                ) : // Resent
                recent.value!.length ? (
                  <>
                    <div class="text-sm md:text-base">Recent</div>
                    <ul class="mt-6 flex flex-col gap-2.5">
                      {recent.value.map((item, index) => (
                        <li key={item.path + item.text}>
                          <SearchItem
                            {...item}
                            index={index}
                            activeIndex={activeIndex}
                            onClick$={() => handleClick(item)}
                            recent
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null
              }
            </div>

            {/* Footer */}
            <footer class="flex h-12 shrink-0 items-center justify-end px-4 text-xs md:h-14 md:text-sm lg:h-[72px] lg:px-6">
              Search by
              <TextLink
                class="ml-2 md:ml-3"
                href="https://www.algolia.com/ref/docsearch/?utm_source=valibot.dev&utm_medium=referral&utm_content=powered_by&utm_campaign=docsearch"
                target="_blank"
              >
                <AlgoliaLogo class="h-8 md:h-10" />
              </TextLink>
            </footer>
          </div>
          <div
            class="hidden lg:absolute lg:top-0 lg:left-0 lg:-z-10 lg:block lg:h-full lg:w-full lg:cursor-default lg:bg-gray-200/50 lg:backdrop-blur-sm lg:dark:bg-gray-800/50"
            role="button"
            onClick$={() => (open.value = false)}
          />
        </>
      )}
    </div>
  );
});

type SearchItemProps = SearchItem & {
  index: number;
  activeIndex: Signal<number>;
  onClick$: () => void;
  recent?: boolean;
};

/**
 * Displays relevant info of a single search result and links to its page.
 */
const SearchItem = component$<SearchItemProps>(
  ({
    type,
    relation,
    page,
    text,
    path,
    index,
    activeIndex,
    onClick$,
    recent,
  }) => {
    // Use element signal
    const element = useSignal<HTMLAnchorElement>();

    // Compute active state
    const active = useComputed$(() => index === activeIndex.value);

    // Scroll element into view if active
    useTask$(({ track }) => {
      track(element);
      track(active);
      if (isBrowser && element.value && active.value) {
        element.value.scrollIntoView({ block: 'nearest' });
      }
    });

    return (
      <Link
        class={clsx(
          'focus-ring flex scroll-my-12 items-center rounded-2xl border-2 px-5 py-4 md:px-6',
          active.value
            ? 'border-transparent bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400'
            : 'border-slate-200 dark:border-slate-800'
        )}
        ref={element}
        href={path}
        onMouseEnter$={() => (activeIndex.value = index)}
        onFocusIn$={() => (activeIndex.value = index)}
        // eslint-disable-next-line qwik/valid-lexical-scope
        onClick$={onClick$}
      >
        {relation === 'page' ? (
          <PageIcon class="h-5 shrink-0 md:h-6" />
        ) : (
          <HashtagIcon class="h-5 shrink-0 md:h-6" />
        )}
        <div
          class={clsx(
            'flex-1 px-4 md:px-5 [&_mark]:bg-transparent [&_mark]:font-medium',
            active.value
              ? '[&_mark]:text-sky-600 [&_mark]:underline [&_mark]:dark:text-sky-400'
              : '[&_mark]:text-slate-900 [&_mark]:dark:text-slate-200'
          )}
        >
          {type === 'content' && (relation === 'none' || recent) && (
            <div
              class="mb-2 text-xs md:text-sm"
              dangerouslySetInnerHTML={page}
            />
          )}
          <div
            class="text-sm md:text-base"
            dangerouslySetInnerHTML={`${
              type !== 'lvl2' &&
              type !== 'content' &&
              (relation === 'none' || recent)
                ? `${page}: `
                : ''
            }${text}`}
          />
        </div>
        <AngleRightIcon class="h-3 shrink-0 md:h-4" />
      </Link>
    );
  }
);
