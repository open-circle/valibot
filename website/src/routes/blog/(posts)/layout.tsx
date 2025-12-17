import { component$, Slot } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';
import { Credits, IconButton, PostCover, PostMeta } from '~/components';
import { PenIcon } from '~/icons';

export default component$(() => {
  // Use document head and location
  const head = useDocumentHead();
  const location = useLocation();

  return (
    <main class="flex flex-1 flex-col items-center py-12 md:py-20 lg:py-28 xl:py-32">
      {/* Article */}
      <article class="flex w-full max-w-(--breakpoint-xl) flex-col gap-12 md:gap-20 lg:gap-24">
        <div class="mx-8 flex max-w-(--breakpoint-md) flex-col gap-5 md:items-center md:gap-7 md:self-center lg:mx-10 lg:gap-9">
          {/* Title */}
          <h1 class="text-2xl leading-normal font-medium text-slate-900 md:text-center md:text-3xl lg:text-4xl dark:text-slate-200">
            {head.title}
          </h1>

          {/* Meta */}
          <PostMeta
            variant="post"
            authors={head.frontmatter.authors}
            published={head.frontmatter.published}
          />
        </div>

        {/* Cover */}
        <PostCover variant="post" label={head.frontmatter.cover} />

        {/* Content */}
        <div class="mdx flex w-full max-w-(--breakpoint-lg) flex-col lg:self-center">
          <Slot />

          {/* Edit page buttton */}
          <IconButton
            class="mx-8 lg:mx-10"
            variant="secondary"
            type="link"
            href={`https://github.com/open-circle/valibot/blob/main/website/src/routes/blog/(posts)${location.url.pathname.slice(5)}index.mdx`}
            target="_blank"
            label="Edit page"
          >
            <PenIcon class="h-[18px]" />
          </IconButton>
        </div>
      </article>

      {/* Credits */}
      <div class="w-full max-w-(--breakpoint-lg)">
        <Credits />
      </div>
    </main>
  );
});
