import { component$ } from '@builder.io/qwik';
import { DiscordIcon } from '~/icons';
import { SystemIcon } from './SystemIcon';

/**
 * Discord icon pointing to our community server.
 */
export const DiscordIconLink = component$(() => (
  <SystemIcon
    label="Join our Discord server"
    type="link"
    href="https://discord.gg/w5mRTETqzv"
    target="_blank"
  >
    <DiscordIcon class="h-full" />
  </SystemIcon>
));
