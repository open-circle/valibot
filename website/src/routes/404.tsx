import { component$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { ActionButton, ButtonGroup } from '~/components';

export const head: DocumentHead = {
  title: 'Page not found',
  meta: [
    {
      name: 'description',
      content:
        "Sorry, the page you are looking for could not be found. You can write us a message if you can't find what you are looking for or return to the home page.",
    },
  ],
};

export default component$(() => (
  <main class="flex w-full max-w-(--breakpoint-lg) flex-1 flex-col self-center py-12 md:py-20 lg:py-32">
    <div class="mdx">
      <h1>Page not found</h1>
      <p>
        Sorry, the page you are looking for could not be found. You can create
        an issue if you can't find what you are looking for or return to the
        home page.
      </p>
    </div>

    <ButtonGroup class="mt-10 px-8 md:mt-12 lg:mt-14 lg:px-10">
      <ActionButton
        variant="primary"
        label="Create issue"
        type="link"
        href="https://github.com/open-circle/valibot/issues/new"
        target="_blank"
      />
      <ActionButton
        variant="secondary"
        label="Home page"
        type="link"
        href="/"
      />
    </ButtonGroup>
  </main>
));
