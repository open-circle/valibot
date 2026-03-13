type EventName =
  | 'change_theme'
  | 'change_chapters'
  | 'open_search'
  | 'select_search_item'
  | 'copy_code_snippet'
  | 'open_code_snippet_in_playground'
  | 'copy_playground_code'
  | 'share_playground_code'
  | 'save_playground_code'
  | 'execute_playground_code'
  | 'clear_playground_logs'
  | 'resize_playground'
  | 'copy_zod_codemod_result'
  | 'execute_zod_codemod';

type EventData = { [key: string]: string | number | boolean | undefined };

declare global {
  interface Window {
    umami?: { track: (name: EventName, data?: EventData) => void };
  }
}

/**
 * Tracks custom Umami events.
 *
 * @param name The event name.
 * @param data The event data.
 */
export function trackEvent(name: EventName, data?: EventData) {
  window.umami?.track(name, data);
}
