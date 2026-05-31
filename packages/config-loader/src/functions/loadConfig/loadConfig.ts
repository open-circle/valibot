import { existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import * as v from 'valibot';
import type { LoadConfigOptions } from '../../types/index.ts';
import { BUILTIN_EXTENSIONS, loadFile } from '../../utils/loadFile.ts';
import { shallowMerge } from '../../utils/shallowMerge.ts';

/**
 * Loads one or more configuration files from disk, applies optional
 * defaults, and validates the result against the provided Valibot schema.
 *
 * For each entry in `name`, the loader searches `cwd` for `<name><ext>`
 * across the union of built-in extensions (`.json`, `.js`, `.mjs`,
 * `.cjs`) and the keys of `parsers`. The first match per name wins; if
 * `name` is an array, every found layer is merged in order so later
 * entries override earlier ones. Missing files are silently skipped, so
 * passing only `defaults` (with no matching file on disk) is valid.
 *
 * `name` must contain at least one entry, and each `name` must be a
 * non-empty literal base name; empty values, or values that are absolute
 * or contain a path separator, are rejected to prevent escaping `cwd`.
 *
 * @param options The load options.
 *
 * @returns The parsed configuration object.
 */
export async function loadConfig<
  TSchema extends
    | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    | v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
>(options: LoadConfigOptions<TSchema>): Promise<v.InferOutput<TSchema>> {
  const cwd = options.cwd ?? process.cwd();
  const merge = options.merge ?? shallowMerge;
  const names =
    typeof options.name === 'string' ? [options.name] : options.name;

  if (names.length === 0) {
    throw new Error('Invalid config name: expected at least one name.');
  }

  const userExtensions = options.parsers ? Object.keys(options.parsers) : [];
  const extensions = [
    ...BUILTIN_EXTENSIONS.filter((ext) => !userExtensions.includes(ext)),
    ...userExtensions,
  ];

  let data: unknown = options.defaults ?? {};
  for (const name of names) {
    if (name === '') {
      throw new Error('Invalid config name: name must not be empty.');
    }
    if (isAbsolute(name) || name.includes('/') || name.includes('\\')) {
      throw new Error(
        `Invalid config name "${name}": expected a base name without path separators.`
      );
    }
    for (const ext of extensions) {
      const file = resolve(cwd, `${name}${ext}`);
      if (!existsSync(file)) continue;
      const value = await loadFile(file, options.parsers);
      data = merge(data, value);
      break;
    }
  }

  return v.parseAsync(options.schema, data);
}
