import { stat } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import * as v from 'valibot';
import type { LoadConfigOptions } from '../../types/index.ts';
import { BUILTIN_EXTENSIONS, loadFile } from '../../utils/loadFile.ts';
import { shallowMerge } from '../../utils/shallowMerge.ts';

/**
 * Returns whether `path` points to an existing regular file. Missing paths
 * resolve to `false` instead of throwing, mirroring `statSync`'s
 * `throwIfNoEntry: false`, while real errors (e.g. permission denied) are
 * left to propagate.
 *
 * @param path The path to check.
 *
 * @returns Whether the path points to an existing regular file.
 *
 * @throws {Error} If an unexpected error occurs while checking the path.
 */
async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

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
 * Discovery is limited to `cwd` itself: parent directories are not
 * traversed and `name` must be a base name (see below), so nested layouts
 * such as `.config/app.json` require pointing `cwd` at that directory.
 *
 * `name` must contain at least one entry, and each `name` must be a
 * non-empty literal base name; empty values, or values that are absolute
 * or contain a path separator, are rejected to prevent escaping `cwd`.
 *
 * JavaScript configs are loaded with dynamic `import()`, which Node.js
 * caches per resolved URL; a file edited after its first load keeps
 * returning the originally imported value until the process restarts.
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

  // Always search built-in extensions in their fixed precedence order;
  // overriding a built-in parser only changes how that extension is
  // parsed (see `loadFile`), not where it sits in the lookup order. Only
  // genuinely new user extensions are appended after the built-ins.
  const userExtensions = options.parsers ? Object.keys(options.parsers) : [];
  const extensions = [
    ...BUILTIN_EXTENSIONS,
    ...userExtensions.filter(
      (ext) => !(BUILTIN_EXTENSIONS as readonly string[]).includes(ext)
    ),
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
      // Skip missing paths as well as directories and other non-regular
      // files, so a directory named like a config file is ignored rather
      // than crashing the loader with EISDIR.
      if (!(await isFile(file))) continue;
      const value = await loadFile(file, options.parsers);
      data = merge(data, value);
      break;
    }
  }

  return v.parseAsync(options.schema, data);
}
