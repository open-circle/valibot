import { component$, Slot } from '@builder.io/qwik';

export default component$(() => (
  <main class="mdx flex w-full max-w-(--breakpoint-lg) flex-1 flex-col self-center py-12 md:py-20 lg:py-32">
    <Slot />
  </main>
));
