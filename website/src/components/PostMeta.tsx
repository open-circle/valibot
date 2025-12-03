import { component$ } from '@builder.io/qwik';
import clsx from 'clsx';

type PostCoverProps = {
  variant: 'blog' | 'post';
  authors: string[];
  published: string;
};

/**
 * Displays the post meta information.
 */
export const PostMeta = component$<PostCoverProps>(
  ({ variant, authors, published }) => (
    <div
      class={clsx('flex items-center gap-4', variant === 'post' && 'lg:gap-5')}
    >
      {/* Authors */}
      <div class="-m-[3px] flex">
        {authors.map((author, index) => (
          <img
            class={clsx(
              'box-content w-6 rounded-full border-[3px] border-white dark:border-gray-900',
              variant === 'blog' && 'lg:w-7',
              variant === 'post' && 'md:w-7 lg:w-8',
              index > 0 && '-ml-3'
            )}
            style={{ zIndex: authors.length - index }}
            key={author}
            src={`https://github.com/${author}.png?size=64`}
            width="64"
            height="64"
            loading="lazy"
            alt={`GitHub profile picture of ${author}`}
          />
        ))}
      </div>

      {/* Date */}
      <time
        class={clsx('text-sm md:text-base', variant === 'post' && 'lg:text-lg')}
        dateTime={published}
      >
        {new Date(published).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </time>
    </div>
  )
);
