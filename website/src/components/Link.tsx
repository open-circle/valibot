import { component$, Slot } from '@builder.io/qwik';
import type { LinkProps } from '@builder.io/qwik-city';
import { Link as RouterLink } from '@builder.io/qwik-city';

/**
 * Thin wrapper around Qwik's Link component with prefetch disabled by default.
 */
export const Link = component$<LinkProps>((props) => {
  return (
    <RouterLink {...props} prefetch={props.prefetch ?? false}>
      <Slot />
    </RouterLink>
  );
});
