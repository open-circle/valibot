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
        <Providers />
      </body>
    </QwikCityProvider>
  );
});
