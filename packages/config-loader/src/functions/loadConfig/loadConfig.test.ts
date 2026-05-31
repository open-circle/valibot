import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as v from 'valibot';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { loadConfig } from './loadConfig.ts';

describe('loadConfig', () => {
  let cwd: string;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'valibot-config-loader-'));
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  test('loads and validates a JSON configuration', async () => {
    writeFileSync(
      join(cwd, 'app.config.json'),
      JSON.stringify({ port: 8080, host: 'example.com' })
    );

    const config = await loadConfig({
      schema: v.object({
        port: v.pipe(v.number(), v.integer()),
        host: v.string(),
      }),
      name: 'app.config',
      cwd,
    });

    expect(config).toStrictEqual({ port: 8080, host: 'example.com' });
  });

  test('merges defaults under the loaded configuration (shallow)', async () => {
    writeFileSync(
      join(cwd, 'app.config.json'),
      JSON.stringify({ host: 'override.example.com' })
    );

    const config = await loadConfig({
      schema: v.object({
        port: v.number(),
        host: v.string(),
      }),
      name: 'app.config',
      cwd,
      defaults: { port: 3000, host: 'default.example.com' },
    });

    expect(config).toStrictEqual({
      port: 3000,
      host: 'override.example.com',
    });
  });

  test('layers multiple base names in order, later overrides earlier', async () => {
    writeFileSync(
      join(cwd, 'app.config.json'),
      JSON.stringify({ port: 3000, host: 'base.example.com' })
    );
    writeFileSync(
      join(cwd, 'app.config.production.json'),
      JSON.stringify({ host: 'prod.example.com' })
    );

    const config = await loadConfig({
      schema: v.object({
        port: v.number(),
        host: v.string(),
      }),
      name: ['app.config', 'app.config.production'],
      cwd,
    });

    expect(config).toStrictEqual({ port: 3000, host: 'prod.example.com' });
  });

  test('skips missing layers when only some named files exist', async () => {
    writeFileSync(
      join(cwd, 'app.config.json'),
      JSON.stringify({ port: 3000, host: 'base.example.com' })
    );

    const config = await loadConfig({
      schema: v.object({ port: v.number(), host: v.string() }),
      name: ['app.config', 'app.config.production'],
      cwd,
    });

    expect(config).toStrictEqual({ port: 3000, host: 'base.example.com' });
  });

  test('uses a user-supplied parser for non-native extensions', async () => {
    writeFileSync(join(cwd, 'app.config.yaml'), 'port: 4040\n');

    const fakeYamlParser = (raw: string): unknown => {
      const lines = raw.trim().split('\n');
      const out: Record<string, unknown> = {};
      for (const line of lines) {
        const [key, value] = line.split(':').map((s) => s.trim());
        out[key] = Number.isNaN(Number(value)) ? value : Number(value);
      }
      return out;
    };

    const config = await loadConfig({
      schema: v.object({ port: v.number() }),
      name: 'app.config',
      cwd,
      parsers: { '.yaml': fakeYamlParser },
    });

    expect(config).toStrictEqual({ port: 4040 });
  });

  test('lets a user-supplied parser override a built-in extension', async () => {
    writeFileSync(join(cwd, 'app.config.json'), '{"port": /* 1234 */ 4040}');

    const tolerantJsonParser = (raw: string): unknown =>
      JSON.parse(raw.replace(/\/\*[\s\S]*?\*\//g, ''));

    const config = await loadConfig({
      schema: v.object({ port: v.number() }),
      name: 'app.config',
      cwd,
      parsers: { '.json': tolerantJsonParser },
    });

    expect(config).toStrictEqual({ port: 4040 });
  });

  test('shallow merge replaces a nested object wholesale', async () => {
    writeFileSync(
      join(cwd, 'app.config.json'),
      JSON.stringify({ database: { url: 'override' } })
    );

    const config = await loadConfig({
      schema: v.object({
        database: v.object({
          url: v.string(),
          poolSize: v.optional(v.number()),
        }),
      }),
      name: 'app.config',
      cwd,
      defaults: { database: { url: 'default', poolSize: 10 } },
    });

    // The default shallow merge only combines top-level keys, so the whole
    // `database` object is replaced and `poolSize` from defaults is dropped.
    expect(config).toStrictEqual({ database: { url: 'override' } });
  });

  test('honors a custom deep merge strategy', async () => {
    writeFileSync(
      join(cwd, 'app.config.json'),
      JSON.stringify({ database: { url: 'override' } })
    );

    const deepMerge = (a: unknown, b: unknown): unknown => {
      if (
        a === null ||
        typeof a !== 'object' ||
        Array.isArray(a) ||
        b === null ||
        typeof b !== 'object' ||
        Array.isArray(b)
      ) {
        return b;
      }
      const out: Record<string, unknown> = {
        ...(a as Record<string, unknown>),
      };
      for (const key of Object.keys(b as Record<string, unknown>)) {
        out[key] = deepMerge(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        );
      }
      return out;
    };

    const config = await loadConfig({
      schema: v.object({
        database: v.object({
          url: v.string(),
          poolSize: v.number(),
        }),
      }),
      name: 'app.config',
      cwd,
      defaults: { database: { url: 'default', poolSize: 10 } },
      merge: deepMerge,
    });

    expect(config).toStrictEqual({
      database: { url: 'override', poolSize: 10 },
    });
  });

  test('falls back to defaults when no configuration file is found', async () => {
    const config = await loadConfig({
      schema: v.object({ port: v.number() }),
      name: 'app.config',
      cwd,
      defaults: { port: 3000 },
    });

    expect(config).toStrictEqual({ port: 3000 });
  });

  test('throws a Valibot error for invalid configuration', async () => {
    writeFileSync(
      join(cwd, 'app.config.json'),
      JSON.stringify({ port: 'not-a-number' })
    );

    await expect(
      loadConfig({
        schema: v.object({ port: v.number() }),
        name: 'app.config',
        cwd,
      })
    ).rejects.toThrow(v.ValiError);
  });

  test('ignores files whose extension has no parser registered', async () => {
    writeFileSync(join(cwd, 'app.config.yaml'), 'port: 4040\n');

    const config = await loadConfig({
      schema: v.object({ port: v.number() }),
      name: 'app.config',
      cwd,
      defaults: { port: 3000 },
    });

    expect(config).toStrictEqual({ port: 3000 });
  });

  test('loads an ESM module with a default export', async () => {
    writeFileSync(
      join(cwd, 'app.config.mjs'),
      'export default { port: 5050, host: "from-mjs" };\n'
    );

    const config = await loadConfig({
      schema: v.object({ port: v.number(), host: v.string() }),
      name: 'app.config',
      cwd,
    });

    expect(config).toStrictEqual({ port: 5050, host: 'from-mjs' });
  });

  test('falls back to the namespace object when a module has no default export', async () => {
    writeFileSync(
      join(cwd, 'app.config.mjs'),
      'export const port = 6060; export const host = "named";\n'
    );

    const config = await loadConfig({
      schema: v.object({ port: v.number(), host: v.string() }),
      name: 'app.config',
      cwd,
    });

    expect(config).toStrictEqual({ port: 6060, host: 'named' });
  });

  test('defaults cwd to process.cwd() when omitted', async () => {
    const original = process.cwd();
    process.chdir(cwd);
    try {
      writeFileSync(
        join(cwd, 'app.config.json'),
        JSON.stringify({ port: 9090 })
      );

      const config = await loadConfig({
        schema: v.object({ port: v.number() }),
        name: 'app.config',
      });

      expect(config).toStrictEqual({ port: 9090 });
    } finally {
      process.chdir(original);
    }
  });

  test('searches every registered extension and picks the first match', async () => {
    writeFileSync(join(cwd, 'app.config.json'), JSON.stringify({ port: 1111 }));

    const fakeYamlParser = (): unknown => ({ port: 2222 });

    const config = await loadConfig({
      schema: v.object({ port: v.number() }),
      name: 'app.config',
      cwd,
      parsers: { '.yaml': fakeYamlParser },
    });

    expect(config).toStrictEqual({ port: 1111 });
  });

  test('rejects a name containing a path separator', async () => {
    await expect(
      loadConfig({
        schema: v.object({ port: v.number() }),
        name: '../app.config',
        cwd,
      })
    ).rejects.toThrow('Invalid config name');
  });

  test('rejects an absolute name', async () => {
    await expect(
      loadConfig({
        schema: v.object({ port: v.number() }),
        name: join(cwd, 'app.config'),
        cwd,
      })
    ).rejects.toThrow('Invalid config name');
  });

  test('rejects a backslash separator in a name', async () => {
    await expect(
      loadConfig({
        schema: v.object({ port: v.number() }),
        name: 'nested\\app.config',
        cwd,
      })
    ).rejects.toThrow('Invalid config name');
  });

  test('rejects an empty name array', async () => {
    await expect(
      loadConfig({
        schema: v.object({ port: v.number() }),
        name: [],
        cwd,
        defaults: { port: 3000 },
      })
    ).rejects.toThrow('expected at least one name');
  });

  test('rejects an empty string name', async () => {
    await expect(
      loadConfig({
        schema: v.object({ port: v.number() }),
        name: '',
        cwd,
      })
    ).rejects.toThrow('must not be empty');
  });

  test('rejects an empty string within a name array', async () => {
    await expect(
      loadConfig({
        schema: v.object({ port: v.number() }),
        name: ['app.config', ''],
        cwd,
      })
    ).rejects.toThrow('must not be empty');
  });

  test('allows a base name that contains dots', async () => {
    writeFileSync(
      join(cwd, 'app.config.production.json'),
      JSON.stringify({ port: 6060 })
    );

    const config = await loadConfig({
      schema: v.object({ port: v.number() }),
      name: 'app.config.production',
      cwd,
    });

    expect(config).toStrictEqual({ port: 6060 });
  });
});
