import { component$ } from '@builder.io/qwik';
import clsx from 'clsx';
import { RssIcon } from '~/icons';

type PostCoverProps = {
  variant: 'blog' | 'post';
  label: string;
};

/**
 * Displays a dynamic post cover image.
 */
export const PostCover = component$<PostCoverProps>(({ variant, label }) => (
  <div
    class={clsx(
      'relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border-2 border-slate-200 select-none dark:border-slate-800',
      variant === 'blog' &&
        'duration-100 will-change-transform hover:-translate-y-1 lg:rounded-2xl',
      variant === 'post' &&
        'mx-3 lg:mx-10 lg:rounded-[32px] lg:border-[3px] 2xl:mx-0'
    )}
  >
    <div class="absolute -top-[60%] -right-[20%] h-[150%] w-[60%] bg-[radial-gradient(theme(--color-yellow-500/.06),transparent_70%)] dark:bg-[radial-gradient(theme(--color-yellow-300/.05),transparent_70%)]" />
    <div class="absolute -bottom-[60%] -left-[20%] h-[150%] w-[60%] bg-[radial-gradient(theme(--color-sky-600/.08),transparent_70%)] dark:bg-[radial-gradient(theme(--color-sky-400/.08),transparent_70%)]" />
    <div
      class={clsx(
        'font-lexend-exa text-center text-[6vw] font-medium text-slate-700 dark:text-slate-300',
        variant === 'blog' && 'md:text-[3vw] lg:text-3xl',
        variant === 'post' && 'lg:text-7xl'
      )}
      role="img"
      aria-label="Post cover image"
    >
      {label}
    </div>
    {variant === 'post' && (
      <a
        class="absolute top-4 right-4 text-slate-500 transition-colors hover:text-slate-700 lg:top-6 lg:right-6 dark:text-slate-400 dark:hover:text-slate-300"
        href="/feed.xml"
        target="_blank"
        aria-label="RSS feed"
      >
        <RssIcon class="h-5 lg:h-6" />
      </a>
    )}
  </div>
));
