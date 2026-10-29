import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ConfigParser } from '../types/options.ts';

/**
 * The file extensions handled natively by {@link loadFile}, in the order
 * they are searched on disk. Reused by the config loader so the set of
 * built-in extensions is declared in a single place.
 */
export const BUILTIN_EXTENSIONS = ['.json', '.js', '.mjs', '.cjs'] as const;

const NATIVE_IMPORT_EXTENSIONS = BUILTIN_EXTENSIONS.slice(1);

/**
 * Reads a configuration file from disk and returns the parsed value.
 *
 * Handles `.json`, `.js`, `.mjs`, and `.cjs` natively. A user-supplied
 * parser in `parsers` takes precedence over the native handler for the
 * same extension, allowing overrides such as a JSON5 parser for `.json`.
 *
 * JavaScript configs are read with dynamic `import()`, which Node.js
 * caches by resolved URL for the lifetime of the process. A config file
 * that changes on disk after its first load therefore keeps returning the
 * originally imported value; restart the process to pick up edits.
 *
 * The default export is used when present (even if it is `null`); a module
 * with no default export falls back to its namespace of named exports. A
 * function-style default export is rejected, since it would otherwise be
 * handed to the schema uncalled.
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
    // Node's readFile preserves a leading UTF-8 BOM, which JSON.parse
    // rejects with a SyntaxError; strip it so BOM-prefixed JSON files
    // (common from some Windows editors) parse correctly.
    return JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
  }

  if ((NATIVE_IMPORT_EXTENSIONS as readonly string[]).includes(ext)) {
    const mod: Record<string, unknown> = await import(pathToFileURL(path).href);
    // A module namespace always carries a `default` key when the file
    // declares `export default`, even if its value is `null`; check for
    // the key rather than truthiness so `export default null` is not
    // silently replaced by the namespace object.
    const value = 'default' in mod ? mod.default : mod;
    // A function-style config (e.g. `export default () => ({ ... })`)
    // would be passed to the schema uncalled and fail with a confusing
    // error; reject it explicitly so the cause is obvious.
    if (typeof value === 'function') {
      throw new Error(
        `Config at "${path}" exports a function, which is not supported. Export a configuration object instead.`
      );
    }
    return value;
  }

  throw new Error(`No parser registered for extension "${ext}".`);
}
