import { component$ } from '@builder.io/qwik';
import { GitHubIcon } from '~/icons';
import { SystemIcon } from './SystemIcon';

/**
 * GitHub icon pointing to our repository.
 */
export const GitHubIconLink = component$(() => (
  <SystemIcon
    label="Open GitHub repository"
    type="link"
    href="https://github.com/open-circle/valibot"
    target="_blank"
  >
    <GitHubIcon class="h-full" />
  </SystemIcon>
));
