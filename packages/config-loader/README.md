# Valibot Config Loader

Official typed configuration file loader for [Valibot](https://valibot.dev). Discover and parse configuration files from disk, merge in defaults, and validate the result against a Valibot schema — all in one call with full type inference.

```ts
import { loadConfig } from '@valibot/config-loader';
import * as v from 'valibot';
import { parse as parseYaml } from 'yaml';

const ConfigSchema = v.object({
  port: v.pipe(v.number(), v.integer()),
  database: v.object({
    url: v.pipe(v.string(), v.url()),
  }),
});

const config = await loadConfig({
  schema: ConfigSchema,
  name: ['myapp.config', `myapp.config.${process.env.NODE_ENV}`],
  parsers: { '.yaml': parseYaml, '.yml': parseYaml },
  defaults: { port: 3000 },
});
// config is typed as v.InferOutput<typeof ConfigSchema>
```

`loadConfig` is always asynchronous: it returns a `Promise<v.InferOutput<TSchema>>` and validates with `parseAsync`, so both synchronous and asynchronous Valibot schemas are supported.

## Design principles

- **Zero runtime dependencies in the core.** `.json` files are read and parsed with `JSON.parse`, while `.js`, `.mjs`, and `.cjs` files are loaded with a dynamic `import()` (the module's default export is used, falling back to the module namespace).
- **Bring-your-own parser** for `.yaml`, `.toml`, `.ini`, JSON5, and friends. Users pass `parsers: { '.yaml': fn }`, where each parser receives the raw file contents as a string and returns the parsed value. The loader stays decoupled from any specific third-party parser.
- **Automatic type inference** — the return type is `v.InferOutput<typeof schema>`.
- **Pluggable merge strategy** — shallow merge by default, deep merge available by passing a custom `merge` (for example `defu` or `lodash.merge`).
- **No baked-in naming convention.** `name` is the literal base name of the file (no `.config.` or environment suffix is appended). Compose the convention you want at the call site.

## File discovery

For every entry in `name`, the loader searches `cwd` (defaults to `process.cwd()`) for `<name><ext>`. The set of extensions is the union of:

The built-in extensions — `.json`, `.js`, `.mjs`, `.cjs` — are searched and handled natively by default.
2. The extensions you registered via `parsers` (the map keys).

The extensions are searched in this order: the built-in extensions first (in the order above), followed by your registered parser extensions (in the order of the `parsers` keys). The **first matching file per name wins** — so if both `myapp.config.json` and `myapp.config.yaml` exist, the `.json` file is used because built-ins are searched first. Missing files are silently skipped — `defaults` alone is a valid configuration.

If you register a parser for one of the built-in extensions (for example `parsers: { '.json': parseJson5 }`), your parser overrides the native handler for that extension. The extension is then searched as part of your registered parser group rather than with the other built-ins, so it loses its built-in search priority.

### Layering multiple files

Pass `name` as an array to load several layers in order. Starting from `defaults`, every found file is merged on top of the previous result, so later entries override earlier ones:

```ts
await loadConfig({
  schema: ConfigSchema,
  name: ['myapp.config', `myapp.config.${process.env.NODE_ENV}`],
  // ...
});
```

This replaces a hard-coded environment overlay convention — naming and ordering are entirely under your control.

## Merging

Before validation, the accumulated value is built by merging each found file on top of the previous result, starting from `defaults` (or `{}` when no defaults are given). The default `merge` is a shallow merge: when both sides are plain objects, their top-level keys are combined with the override taking precedence; otherwise the override replaces the previous value entirely.

Because the merge is shallow, only top-level keys are combined — a nested object on the override side **replaces the corresponding object entirely** rather than being merged key by key:

```ts
// myapp.config.json (on disk):
// { "database": { "url": "https://prod.example.com" } }

const config = await loadConfig({
  schema: ConfigSchema,
  name: 'myapp.config',
  defaults: {
    port: 3000,
    database: { url: 'https://localhost', poolSize: 10 },
  },
});
// merge(defaults, file) -> {
//   port: 3000, // kept from defaults, since the file has no `port`
//   database: { url: 'https://prod.example.com' }, // replaced wholesale, so `poolSize` is gone
// }
```

Pass a custom `merge` to opt into deep merging (for example `defu` or `lodash.merge`) or any other strategy.

## Options

| Option     | Type                                       | Description                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema`   | `v.BaseSchema` / `v.BaseSchemaAsync`       | Required. The Valibot schema used to validate the loaded configuration. Validation runs through `parseAsync`, so both sync and async schemas work.                                                                            |
| `name`     | `string \| readonly string[]`              | Required. The literal base name(s) of the file(s) to load. When an array is given, every found file is merged in order so later entries override earlier ones.                                                                |
| `cwd`      | `string`                                   | Working directory to search from. Defaults to `process.cwd()`.                                                                                                                                                              |
| `parsers`  | `Record<string, (raw: string) => unknown>` | Map of extension (including the leading dot) to parser function. The keys also drive discovery — any registered extension is searched for. A user entry for `.json` / `.js` / `.mjs` / `.cjs` overrides the built-in handler. |
| `defaults` | `Partial<v.InferInput<TSchema>>`           | Default values used as the starting point of the merge, before any file is loaded and before validation.                                                                                                                     |
| `merge`    | `(defaults, override) => unknown`          | Custom merge strategy. Defaults to a shallow merge that replaces top-level keys.                                                                                                                                             |

## Alternatives

- [`cosmiconfig`](https://github.com/cosmiconfig/cosmiconfig) — broader discovery rules, but Valibot integration is manual.
- [`c12`](https://github.com/unjs/c12) — richer feature set tied to the unjs ecosystem.
