import { component$ } from '@builder.io/qwik';
import clsx from 'clsx';

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
    role="img"
    aria-label="Post cover image"
  >
    <div class="absolute -top-[60%] -right-[20%] h-[150%] w-[60%] bg-[radial-gradient(theme(--color-yellow-500/.06),transparent_70%)] dark:bg-[radial-gradient(theme(--color-yellow-300/.05),transparent_70%)]" />
    <div class="absolute -bottom-[60%] -left-[20%] h-[150%] w-[60%] bg-[radial-gradient(theme(--color-sky-600/.08),transparent_70%)] dark:bg-[radial-gradient(theme(--color-sky-400/.08),transparent_70%)]" />
    <div
      class={clsx(
        'font-lexend-exa text-center text-[6vw] font-medium text-slate-700 dark:text-slate-300',
        variant === 'blog' && 'md:text-[3vw] lg:text-3xl',
        variant === 'post' && 'lg:text-7xl'
      )}
    >
      {label}
    </div>
  </div>
));
