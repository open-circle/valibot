import type * as v from 'valibot';

/**
 * A parser function that turns the raw text contents of a configuration file
 * into a structured value.
 *
 * @param raw The raw file contents.
 *
 * @returns The parsed value.
 */
export type ConfigParser = (raw: string) => unknown;

/**
 * A merge function that combines defaults and the value loaded from a file.
 *
 * @param defaults The current accumulated value (defaults or earlier overlays).
 * @param override The newly loaded value to merge on top.
 *
 * @returns The merged value.
 */
export type ConfigMerger = (defaults: unknown, override: unknown) => unknown;

/**
 * Configuration loader options.
 */
export interface LoadConfigOptions<
  TSchema extends
    | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    | v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
> {
  /**
   * The Valibot schema used to validate the loaded configuration.
   */
  readonly schema: TSchema;
  /**
   * The base name(s) of the configuration file. For each name, the loader
   * searches `<name><ext>` against the known extensions and loads the first
   * match. When an array is given, every found file is loaded in the
   * provided order and merged on top of the previous layer, so later
   * entries override earlier ones (e.g.
   * `['app.config', 'app.config.production']`).
   */
  readonly name: string | readonly string[];
  /**
   * The working directory to search from. Defaults to `process.cwd()`.
   */
  readonly cwd?: string;
  /**
   * A map of file extension (including the leading dot) to a parser
   * function. The keys also drive file discovery: any extension listed
   * here is searched for. The built-in extensions `.json`, `.js`, `.mjs`,
   * and `.cjs` are always searched and handled natively, but can be
   * overridden by supplying an entry with the same key.
   */
  readonly parsers?: Readonly<Record<string, ConfigParser>>;
  /**
   * Default values that are merged with the loaded configuration before
   * validation.
   */
  readonly defaults?: Partial<v.InferInput<TSchema>>;
  /**
   * A custom merge strategy. Defaults to a shallow merge that replaces
   * top-level keys.
   */
  readonly merge?: ConfigMerger;
}
