let timeout: NodeJS.Timeout | undefined;

/**
 * Disables CSS transitions for a short moment.
 */
export function disableTransitions() {
  if (timeout) clearTimeout(timeout);
  const { classList } = document.documentElement;
  classList.add('disable-transitions');
  timeout = setTimeout(() => classList.remove('disable-transitions'), 500);
}
