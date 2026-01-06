import { component$, Fragment } from '@builder.io/qwik';
import { type DocumentHead, useContent } from '@builder.io/qwik-city';
import { ApiList } from '~/components';

export const head: DocumentHead = {
  title: 'API reference',
  meta: [
    {
      name: 'description',
      content:
        'This section of our website contains detailed reference documentation for working with Valibot.',
    },
  ],
  frontmatter: {
    contributors: ['fabian-hiller'],
  },
};

export default component$(() => {
  // Use content
  const content = useContent();

  return (
    <>
      <h1>API reference</h1>
      <p>
        This section of our website contains detailed reference documentation
        for working with Valibot. Please create an{' '}
        <a
          href="https://github.com/open-circle/valibot/issues/new"
          target="_blank"
          rel="noreferrer"
        >
          issue
        </a>{' '}
        if you are missing any information.
      </p>

      {content.menu?.items?.map(
        (item) =>
          item.items && (
            <Fragment key={item.text}>
              <h2 id={item.text.toLowerCase()}>{item.text}</h2>
              <ApiList items={item.items.map((i) => i.text)} />
            </Fragment>
          )
      )}
    </>
  );
});
