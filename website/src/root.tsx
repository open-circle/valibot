import { component$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city';
import { Head } from './components';
import { useChaptersProvider } from './routes/plugin@chapters';
import { useThemeProvider } from './routes/plugin@theme';
import './styles/root.css';
import { disableTransitions } from './utils';

export default component$(() => {
  useThemeProvider();
  useChaptersProvider();

  return (
    <QwikCityProvider>
      <Head />
      <body
        class="font-lexend flex min-h-screen flex-col bg-white text-slate-600 dark:bg-gray-900 dark:text-slate-400"
        window:onResize$={() => disableTransitions()}
      >
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
