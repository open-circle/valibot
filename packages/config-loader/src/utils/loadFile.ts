import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ConfigParser } from '../types/options.ts';

/**
 * Reads a configuration file from disk and returns the parsed value.
 *
 * Handles `.json`, `.js`, `.mjs`, and `.cjs` natively. A user-supplied
 * parser in `parsers` takes precedence over the native handler for the
 * same extension, allowing overrides such as a JSON5 parser for `.json`.
 *
 * @param path The absolute path to the configuration file.
 * @param parsers Optional map of file extension to parser function.
 *
 * @returns The parsed configuration value.
 */
export async function loadFile(
  path: string,
  parsers: Readonly<Record<string, ConfigParser>> | undefined
): Promise<unknown> {
  const ext = extname(path);

  const parser = parsers?.[ext];
  if (parser) {
    const raw = await readFile(path, 'utf8');
    return parser(raw);
  }

  if (ext === '.json') {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw);
  }

  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
    const mod: { default?: unknown } = await import(pathToFileURL(path).href);
    return mod.default ?? mod;
  }

  throw new Error(`No parser registered for extension "${ext}".`);
}
