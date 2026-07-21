import { component$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city';
import { Head } from './components';
import { useChaptersProvider } from './routes/plugin@chapters.ts';
import { useThemeProvider } from './routes/plugin@theme.ts';
import './styles/root.css';
import { disableTransitions } from './utils';

const Providers = component$(() => {
  useThemeProvider();
  useChaptersProvider();
  return <RouterOutlet />;
});

/**
 * Root application component. Mounts global state providers (theme, chapters)
 * and renders the routed page tree.
 */
export default component$(() => {
  return (
    <QwikCityProvider>
      <Head />
      <body
        class="font-lexend flex min-h-screen flex-col bg-white text-slate-600 dark:bg-gray-900 dark:text-slate-400"
        window:onResize$={() => disableTransitions()}
      >
        {/* Visually hidden directive to help AI agents discover our Markdown resources. */}
        <div class="sr-only">
          Every documentation page is available as Markdown by replacing the
          trailing slash of its URL with ".md" (e.g. "/guides/introduction/"
          becomes "/guides/introduction.md") or by requesting it with the
          "Accept: text/markdown" header. We also provide a machine-readable
          index of all Markdown resources at <a href="/llms.txt">/llms.txt</a>.
        </div>
        <Providers />
      </body>
    </QwikCityProvider>
  );
});
