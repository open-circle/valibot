import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as v from 'valibot';
import type { LoadConfigOptions } from '../../types/index.ts';
import { loadFile } from '../../utils/loadFile.ts';
import { shallowMerge } from '../../utils/shallowMerge.ts';

const BUILTIN_EXTENSIONS = ['.json', '.js', '.mjs', '.cjs'] as const;

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

  const userExtensions = options.parsers ? Object.keys(options.parsers) : [];
  const extensions = [
    ...BUILTIN_EXTENSIONS.filter((ext) => !userExtensions.includes(ext)),
    ...userExtensions,
  ];

  let data: unknown = options.defaults ?? {};
  for (const name of names) {
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
