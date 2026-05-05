import { component$, useComputed$ } from '@builder.io/qwik';
import {
  type DocumentHead,
  Form,
  routeAction$,
  z,
  zod$,
} from '@builder.io/qwik-city';
import clsx from 'clsx';
import { ActionButton, ButtonGroup, Expandable, TextLink } from '~/components';
import { PlayIcon, PlusIcon } from '~/icons';
import { valibotTalkDarkUrl, valibotTalkLigthUrl } from '~/images';

export const head: DocumentHead = {
  title: 'Valibot: The modular and type safe schema library',
  meta: [
    {
      name: 'description',
      content:
        'Validate unknown data with Valibot, the open source schema library with bundle size, type safety and developer experience in mind.',
    },
  ],
};

/**
 * Toggles the index of the FAQ.
 */
export const useFaqToggle = routeAction$(
  (values) => values,
  zod$({ index: z.coerce.number() })
);

export default component$(() => {
  // Use FAQ toggle and compute its index
  const faqToggle = useFaqToggle();
  const faqIndex = useComputed$(
    () =>
      +(
        (faqToggle.isRunning
          ? // Optimistic UI
            faqToggle.formData?.get('index')
          : faqToggle.value?.index) || 0
      )
  );

  return (
    <main class="flex flex-1 flex-col items-center gap-24 py-24 md:gap-36 md:py-36 xl:gap-52 xl:py-52">
      {/* Pitch */}
      <section class="px-4 text-center">
        <h1 class="font-lexend-exa text-[min(6.2vw,30px)] leading-normal font-medium text-slate-900 md:text-[34px] lg:text-[40px] xl:text-5xl dark:text-slate-200">
          <span class="block">
            Validate{' '}
            <span class="cursor-default blur-[1px] duration-[2s] hover:blur-none xl:blur-[2px]">
              unknown
            </span>
          </span>{' '}
          <span class="cursor-default blur-[2px] duration-[2s] hover:blur-none xl:blur-[3px]">
            data
          </span>{' '}
          with confidence
        </h1>
        <p class="mt-6 leading-loose md:mt-10 md:text-[17px] lg:mt-14 lg:text-lg xl:text-[22px] xl:leading-loose">
          <span class="sm:block">
            Valibot is the open source schema library for TypeScript with bundle
          </span>{' '}
          size, type safety and developer experience in mind.
        </p>
        <ButtonGroup class="mt-8 justify-center md:mt-12 lg:mt-16">
          <ActionButton
            variant="primary"
            label="Get started"
            type="link"
            href="/guides/introduction/"
          />
          <ActionButton
            variant="secondary"
            label="Playground"
            type="link"
            href="/playground/"
          />
        </ButtonGroup>
        <div class="absolute top-0 left-0 -z-10 flex w-full justify-center overflow-x-clip">
          <div class="relative w-full xl:w-0">
            <div class="absolute -top-[250px] -right-[300px] h-[600px] w-[600px] bg-[radial-gradient(theme(--color-yellow-500/.08),transparent_70%)] md:-top-[500px] md:-right-[500px] md:h-[1000px] md:w-[1000px] xl:-top-[500px] xl:-right-[1100px] dark:bg-[radial-gradient(theme(--color-yellow-300/.08),transparent_70%)]" />
            <div class="absolute top-[200px] -left-[370px] h-[600px] w-[600px] bg-[radial-gradient(theme(--color-sky-600/.08),transparent_70%)] md:top-[100px] md:-left-[550px] md:h-[1000px] md:w-[1000px] lg:top-[200px] xl:top-[300px] xl:-left-[1100px] dark:bg-[radial-gradient(theme(--color-sky-400/.08),transparent_70%)]" />
          </div>
        </div>
      </section>

      {/* Video */}
      <section class="w-full px-3 md:max-w-5xl xl:max-w-[1360px] xl:px-10">
        <div class="relative z-0 flex aspect-video w-full items-center justify-center overflow-hidden rounded-3xl border-[3px] border-slate-200 bg-white md:border-4 lg:rounded-[32px] dark:border-slate-800 dark:bg-gray-900">
          {[
            { theme: 'dark', url: valibotTalkDarkUrl },
            { theme: 'light', url: valibotTalkLigthUrl },
          ].map(({ theme, url }) => (
            // eslint-disable-next-line qwik/jsx-img
            <img
              key={url}
              class={clsx(
                'absolute -z-10 h-full w-full object-cover object-center',
                theme === 'dark' ? 'hidden dark:block' : 'dark:hidden'
              )}
              src={url}
              alt="Talk: Going fully modular with Valibot"
            />
          ))}
          <a
            class="focus-ring absolute flex h-10 w-16 animate-bounce items-center justify-center rounded-xl bg-sky-500/10 backdrop-blur hover:bg-sky-500/20 md:h-12 md:w-20 lg:h-16 lg:w-28 lg:backdrop-blur-lg dark:bg-sky-400/10 dark:hover:bg-sky-400/20"
            href="https://youtu.be/AnXbYrGdxv0"
            target="_blank"
            rel="noreferrer"
          >
            <PlayIcon class="h-4 text-sky-500 md:h-5 lg:h-6 dark:text-sky-400" />
          </a>
        </div>
      </section>

      {/* Highlights */}
      <section class="lg:max-w-6xl">
        <h2 class="px-4 text-center text-xl font-medium text-slate-900 md:text-2xl lg:text-3xl xl:text-4xl dark:text-slate-200">
          Highlights you should not miss
        </h2>
        <ul class="mt-16 flex flex-wrap justify-center gap-16 px-8 md:mt-20 lg:mt-32 xl:mt-36 xl:gap-24">
          {[
            {
              emoji: '🔒',
              heading: 'Fully type safe',
              text: 'Enjoy the benefits of type safety and static type inference in TypeScript',
            },
            {
              emoji: '📦',
              heading: 'Small bundle size',
              text: 'Due to the modular design of our API the bundle size starts at less than 700 bytes',
            },
            {
              emoji: '🚧',
              heading: 'Validate everything',
              text: 'Supports almost any TypeScript type from primitive values to complex objects',
            },
            {
              emoji: '🛟',
              heading: '100% test coverage',
              text: "Valibot's source code is open source and fully tested with 100% coverage",
            },
            {
              emoji: '🔋',
              heading: 'Helpers included',
              text: 'Important validation and transformation helpers are already included',
            },
            {
              emoji: '🧑‍💻',
              heading: 'API with great DX',
              text: 'Minimal, readable and well thought out API for a great developer experience',
            },
          ].map(({ emoji, heading, text }) => (
            <li
              key={emoji}
              class="flex flex-col items-center gap-6 text-center md:gap-7 lg:max-w-[45%] lg:flex-row lg:items-start lg:gap-8 lg:text-left"
            >
              <div class="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-sky-600/10 text-2xl dark:bg-sky-400/5">
                {emoji}
              </div>
              <div class="flex max-w-[370px] flex-col gap-4 md:gap-5">
                <h3 class="text-lg font-medium text-slate-900 md:text-xl dark:text-slate-200">
                  {heading}
                </h3>
                <p class="leading-loose md:text-lg md:leading-loose">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section class="flex flex-col gap-14 md:max-w-4xl md:gap-20 lg:gap-32">
        <h2 class="px-4 text-center text-xl font-medium text-slate-900 md:text-2xl lg:text-3xl xl:text-4xl dark:text-slate-200">
          Frequently asked questions
        </h2>
        <ul class="flex flex-col gap-12 md:gap-14 lg:gap-16">
          {[
            {
              heading: 'Where can I enter my credit card?',
              Text: () => (
                <>
                  You don't have to! Valibot is available free of charge and
                  licensed under the{' '}
                  <TextLink
                    href="https://github.com/open-circle/valibot/blob/main/LICENSE.md"
                    target="_blank"
                    underlined
                    colored
                  >
                    MIT License
                  </TextLink>
                  . However, we rely on partners and sponsors to fund the
                  project. If your company would like to support us, you can
                  take a look at our sponsor page on{' '}
                  <TextLink
                    href="https://github.com/sponsors/fabian-hiller"
                    target="_blank"
                    underlined
                    colored
                  >
                    GitHub
                  </TextLink>
                  .
                </>
              ),
            },
            {
              heading: 'What exactly does Valibot do?',
              Text: () => (
                <>
                  The core function of Valibot is to create a schema that
                  describes a structured data set. A schema can be compared to a
                  type definition in TypeScript. The big difference is that
                  TypeScript types are "not executed" and are more or less a DX
                  feature. A schema on the other hand, apart from the inferred
                  type definition, can also be executed at runtime to guarantee
                  type safety of unknown data.
                </>
              ),
            },
            {
              heading: 'How does a modular design reduce bundle size?',
              Text: () => (
                <>
                  Due to the modular design of our API, a bundler can use the
                  import statements to remove the code you don't need. This way,
                  only the code that is actually used ends up in your production
                  build. This also allows us to add new functionality to Valibot
                  without increasing the size for all users.
                </>
              ),
            },
            {
              heading: 'How is it different from Zod?',
              Text: () => (
                <>
                  The functionality of Valibot is very similar to Zod. The
                  biggest difference is the modular design of our API and the
                  ability to reduce the bundle size to a minimum through tree
                  shaking and code splitting. Depending on the schema, Valibot
                  can reduce the bundle size up to 95% compared to Zod.
                  Especially for client-side validation of forms and serverless
                  environments this can be a big advantage.
                </>
              ),
            },
          ].map(({ heading, Text }, index) => {
            const isOpen = index === faqIndex.value;
            return (
              <li key={heading} class="flex flex-col px-8">
                <Form action={faqToggle}>
                  <input type="hidden" name="index" value={index} />
                  <button
                    class={clsx(
                      'focus-ring flex w-full justify-between gap-4 rounded-md transition-colors focus-visible:ring-offset-8 focus-visible:outline-offset-[6px]',
                      isOpen
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-slate-800 hover:text-slate-700 dark:text-slate-300 hover:dark:text-slate-400'
                    )}
                    type="submit"
                    disabled={isOpen}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${index}`}
                  >
                    <span class="text-left leading-relaxed font-medium md:text-xl lg:text-2xl">
                      {heading}
                    </span>
                    <PlusIcon
                      class={clsx(
                        'mt-1.5 h-4 shrink-0 transition-transform lg:h-5',
                        isOpen && 'rotate-45'
                      )}
                      stroke-width={6}
                    />
                  </button>
                </Form>
                <Expandable
                  id={`faq-${index}`}
                  class="overflow-hidden"
                  expanded={isOpen}
                >
                  <p class="pt-6 leading-loose md:pt-7 md:text-lg lg:pt-8 lg:text-xl lg:leading-loose">
                    <Text />
                  </p>
                </Expandable>
              </li>
            );
          })}
        </ul>
      </section>

      {/* CTA */}
      <ButtonGroup class="justify-center">
        <ActionButton
          variant="primary"
          label="Get started"
          type="link"
          href="/guides/introduction/"
        />
        <ActionButton
          variant="secondary"
          label="Playground"
          type="link"
          href="/playground/"
        />
      </ButtonGroup>
    </main>
  );
});
