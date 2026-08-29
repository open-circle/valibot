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
        {/* Hint for AI agents on how to consume our documentation as Markdown.
          Hidden from the accessibility tree and kept free of focusable links,
          as it targets crawlers and agents reading the HTML, not users. */}
        <div aria-hidden="true" class="sr-only">
          Every documentation page is available as Markdown by replacing the
          trailing slash of its URL with ".md" (e.g. "/guides/introduction/"
          becomes "/guides/introduction.md") or by requesting it with the
          "Accept: text/markdown" header. An MCP server with tools to search and
          read this documentation is available at "/mcp". We also provide a
          machine-readable index of all Markdown resources at "/llms.txt".
        </div>
        <Providers />
      </body>
    </QwikCityProvider>
  );
});
