import {
  component$,
  type ReadonlySignal,
  Slot,
  useComputed$,
} from '@builder.io/qwik';
import {
  type ContentMenu,
  Form,
  useContent,
  useDocumentHead,
  useLocation,
} from '@builder.io/qwik-city';
import clsx from 'clsx';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  GitHubIcon,
  MarkdownIcon,
  MenuIcon,
  PenIcon,
} from '~/icons';
import { useChapters, useChaptersToggle } from '~/routes/plugin@chapters';
import { trackEvent } from '~/utils';
import '../styles/pace.css';
import { Chapters } from './Chapters';
import { Credits } from './Credits';
import { IconButton } from './IconButton';
import { Navigation } from './Navigation';
import { SideBar, useSideBarToggle } from './SideBar';

type NavItem = ContentMenu & { group: string };

/**
 * Provides the layout for the documentation pages.
 */
export const DocsLayout = component$(() => {
  // Use location, content, docuemnt head and chapters
  const location = useLocation();
  const content = useContent();
  const documentHead = useDocumentHead();
  const chapters = useChapters();

  // Use side bar and chapters toggle
  const sideBarToggle = useSideBarToggle();
  const chaptersToggle = useChaptersToggle();

  // Compute navigation items
  const navItems = useComputed$(
    () =>
      content.menu?.items?.reduce<NavItem[]>(
        (list, { text, items }) =>
          items
            ? [...list, ...items.map((item) => ({ ...item, group: text }))]
            : list,
        []
      ) || []
  );

  // Compute current navigation index
  const navIndex = useComputed$(() =>
    navItems.value.findIndex((item) => item.href === location.url.pathname)
  );

  // Compute previous, current and next page
  const prevPage = useComputed$<NavItem | undefined>(
    () => navItems.value[navIndex.value - 1]
  );
  const currentPage = useComputed$<NavItem | undefined>(
    () => navItems.value[navIndex.value]
  );
  const nextPage = useComputed$<NavItem | undefined>(
    () => navItems.value[navIndex.value + 1]
  );

  // Optimistically compute whether to show chapters
  const showChapters = useComputed$(() =>
    chaptersToggle.isRunning ? !chapters.value : chapters.value
  );

  // Compute Markdown path from current location; skip on '/api/'
  const mdPath = useComputed$(() =>
    location.url.pathname === '/api/'
      ? undefined
      : `${location.url.pathname.replace(/\/$/, '')}.md`
  );

  return (
    <div
      class={clsx(
        'flex w-full flex-1 flex-col-reverse self-center lg:flex-row',
        showChapters.value
          ? 'max-w-(--breakpoint-2xl)'
          : 'max-w-(--breakpoint-xl)'
      )}
    >
      {/* Side bar navigation */}
      <SideBar class="lg:max-h-[calc(100vh-70px)]" toggle={sideBarToggle}>
        <div q:slot="buttons" class="mr-4 flex gap-6 lg:hidden">
          <NavButtons
            pageIndex={navIndex.value}
            sourcePath={documentHead.frontmatter.source}
            mdPath={mdPath.value}
            prevPage={prevPage.value}
            nextPage={nextPage.value}
          />
        </div>
        <Navigation
          class={clsx(
            'px-8 py-9 lg:w-60 lg:py-24 xl:py-32',
            showChapters.value ? '2xl:w-64' : '2xl:w-72'
          )}
        />
      </SideBar>

      <main
        class={clsx(
          'relative flex-1 py-12 md:py-14 lg:w-px lg:py-24 xl:py-32',
          showChapters.value ? 'lg:px-9' : 'lg:pl-9'
        )}
      >
        {/* Navigation buttons */}
        <nav
          class={clsx(
            'hidden px-8 lg:absolute lg:flex lg:gap-6 lg:px-10',
            showChapters.value ? 'lg:right-9' : 'lg:right-0'
          )}
        >
          <NavButtons
            pageIndex={navIndex.value}
            sourcePath={documentHead.frontmatter.source}
            mdPath={mdPath.value}
            prevPage={prevPage.value}
            nextPage={nextPage.value}
            chapters={chapters}
            chaptersToggle={chaptersToggle}
          />
        </nav>

        {/* Article */}
        <article class="mdx flex flex-col">
          <Slot />
        </article>

        {currentPage.value?.href && (
          <nav class="mt-10 flex justify-between px-8 md:mt-12 lg:mt-14 lg:px-10">
            {/* Edit page buttton */}
            <IconButton
              variant="secondary"
              type="link"
              href={`https://github.com/open-circle/valibot/blob/main/website/src/routes${currentPage.value.href.replace(
                /^(\/.+)\/(.+\/)$/,
                `$1/(${currentPage.value.group
                  .toLowerCase()
                  .replace(/\s/g, '-')})/$2`
              )}index.mdx`}
              target="_blank"
              label="Edit page"
            >
              <PenIcon class="h-[18px]" />
            </IconButton>

            {/* Next page button */}
            {nextPage.value?.href && (
              <div class="hidden lg:block">
                <IconButton
                  variant="secondary"
                  type="link"
                  href={nextPage.value.href}
                  label="Next page"
                  align="right"
                >
                  <ArrowRightIcon class="h-[18px]" />
                </IconButton>
              </div>
            )}
          </nav>
        )}

        {/* Credits */}
        <Credits />
      </main>

      {showChapters.value && (
        <aside class="hidden xl:block xl:w-60 xl:px-8 xl:py-32 2xl:w-64">
          <Chapters />
        </aside>
      )}
    </div>
  );
});

type NavButtonsProps = {
  pageIndex: number;
  sourcePath: string | undefined;
  mdPath: string | undefined;
  prevPage: ContentMenu | undefined;
  nextPage: ContentMenu | undefined;
  chapters?: ReadonlySignal<boolean>;
  chaptersToggle?: ReturnType<typeof useChaptersToggle>;
};

/**
 * Buttons to navigate to the previous or next page.
 */
export const NavButtons = component$<NavButtonsProps>(
  ({
    pageIndex,
    sourcePath,
    mdPath,
    prevPage,
    nextPage,
    chapters,
    chaptersToggle,
  }) => (
    <>
      {pageIndex !== -1 && (
        <>
          {prevPage?.href ? (
            <IconButton
              variant="secondary"
              type="link"
              href={prevPage.href}
              label="Previous page"
              hideLabel
            >
              <ArrowLeftIcon class="h-[18px]" />
            </IconButton>
          ) : (
            <div class="w-10" />
          )}
          {nextPage?.href ? (
            <IconButton
              variant="secondary"
              type="link"
              href={nextPage.href}
              label="Next page"
              hideLabel
            >
              <ArrowRightIcon class="h-[18px]" />
            </IconButton>
          ) : (
            <div class="w-10" />
          )}
        </>
      )}
      {chaptersToggle && (
        <Form
          class="hidden xl:block"
          action={chaptersToggle}
          onSubmit$={() =>
            trackEvent('change_chapters', { enabled: !chapters!.value })
          }
        >
          <IconButton
            variant="secondary"
            type="submit"
            label={chapters!.value ? 'Hide chapters' : 'Show chapters'}
            hideLabel
          >
            <MenuIcon class="h-[18px]" />
          </IconButton>
        </Form>
      )}
      {sourcePath && (
        <IconButton
          variant="secondary"
          type="link"
          href={`https://github.com/open-circle/valibot/blob/main/library/src${sourcePath}`}
          target="_blank"
          label="Source code"
          hideLabel
        >
          <GitHubIcon class="h-[18px]" />
        </IconButton>
      )}
      {mdPath && (
        <IconButton
          variant="secondary"
          type="link"
          href={mdPath}
          label="View as Markdown"
          hideLabel
        >
          <MarkdownIcon class="h-[18px]" />
        </IconButton>
      )}
    </>
  )
);
