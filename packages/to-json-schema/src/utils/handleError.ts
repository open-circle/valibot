import type { ConversionConfig } from '../types/index.ts';

/**
 * Throws an error or logs a warning based on the configuration.
 *
 * @param message The message to throw or log.
 * @param config The conversion configuration.
 */
export function handleError(
  message: string,
  config: ConversionConfig | undefined
): void {
  switch (config?.errorMode) {
    case 'ignore': {
      break;
    }
    case 'warn': {
      console.warn(message);
      break;
    }
    default: {
      throw new Error(message);
    }
  }
}
