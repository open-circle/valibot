import { $, component$, useComputed$ } from '@builder.io/qwik';
import { NightIcon, SunIcon } from '~/icons';
import { useTheme, useThemeToggle } from '~/routes/plugin@theme';
import { disableTransitions, trackEvent } from '~/utils';
import { SystemIcon } from './SystemIcon';

type ThemeToggleProps = {
  class?: string;
};

/**
 * Button for switching the color theme. Depending on the status, a sun or
 * night icon is displayed.
 */
export const ThemeToggle = component$<ThemeToggleProps>((props) => {
  // Use theme and theme toggle
  const theme = useTheme();
  const themeToggle = useThemeToggle();

  // Compute value of next theme
  const nextTheme = useComputed$(() =>
    theme.value === 'dark' ? 'light' : 'dark'
  );

  /**
   * Handles client-side theme change actions.
   */
  const onClick = $(() => {
    disableTransitions();
    trackEvent('change_theme', { theme: nextTheme.value });
    themeToggle();
  });

  return (
    <div class={props.class}>
      <SystemIcon
        type="button"
        label={`Change theme to ${nextTheme.value}`}
        onClick$={onClick}
      >
        <SunIcon class="hidden h-full dark:block" />
        <NightIcon class="h-full dark:hidden" />
      </SystemIcon>
    </div>
  );
});
