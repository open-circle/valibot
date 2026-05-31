import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { loadFile } from './loadFile.ts';

describe('loadFile', () => {
  let cwd: string;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'valibot-load-file-'));
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  test('parses a .json file via the native handler', async () => {
    const path = join(cwd, 'app.json');
    writeFileSync(path, JSON.stringify({ port: 8080 }));

    expect(await loadFile(path, undefined)).toStrictEqual({ port: 8080 });
  });

  test('parses a .json file prefixed with a UTF-8 BOM', async () => {
    const path = join(cwd, 'app.json');
    writeFileSync(path, `\uFEFF${JSON.stringify({ port: 8080 })}`);

    expect(await loadFile(path, undefined)).toStrictEqual({ port: 8080 });
  });

  test('returns the default export of a .mjs module', async () => {
    const path = join(cwd, 'app.mjs');
    writeFileSync(path, 'export default { port: 5050 };\n');

    expect(await loadFile(path, undefined)).toStrictEqual({ port: 5050 });
  });

  test('returns the namespace object when a .mjs module has no default export', async () => {
    const path = join(cwd, 'app.mjs');
    writeFileSync(path, 'export const port = 6060;\n');

    expect(await loadFile(path, undefined)).toMatchObject({ port: 6060 });
  });

  test('returns the default export of a .cjs module', async () => {
    const path = join(cwd, 'app.cjs');
    writeFileSync(path, 'module.exports = { port: 7070 };\n');

    expect(await loadFile(path, undefined)).toStrictEqual({ port: 7070 });
  });

  test('uses a user-supplied parser for an unknown extension', async () => {
    const path = join(cwd, 'app.yaml');
    writeFileSync(path, 'port: 4040\n');

    const parser = (raw: string): unknown => ({ raw: raw.trim() });

    expect(await loadFile(path, { '.yaml': parser })).toStrictEqual({
      raw: 'port: 4040',
    });
  });

  test('prefers a user-supplied parser over the native handler for the same extension', async () => {
    const path = join(cwd, 'app.json');
    writeFileSync(path, JSON.stringify({ port: 8080 }));

    const tagged = (raw: string): unknown => ({ raw, fromUserParser: true });

    expect(await loadFile(path, { '.json': tagged })).toStrictEqual({
      raw: JSON.stringify({ port: 8080 }),
      fromUserParser: true,
    });
  });

  test('throws when no parser is registered and the extension is not native', async () => {
    const path = join(cwd, 'app.toml');
    writeFileSync(path, 'port = 1234\n');

    await expect(loadFile(path, undefined)).rejects.toThrow(
      /No parser registered for extension "\.toml"/
    );
  });

  test('throws when parsers is provided but does not cover the extension', async () => {
    const path = join(cwd, 'app.toml');
    writeFileSync(path, 'port = 1234\n');

    await expect(loadFile(path, { '.yaml': () => ({}) })).rejects.toThrow(
      /No parser registered/
    );
  });

  test('propagates errors thrown by JSON.parse', async () => {
    const path = join(cwd, 'app.json');
    writeFileSync(path, '{ not-json');

    await expect(loadFile(path, undefined)).rejects.toThrow(SyntaxError);
  });

  test('propagates errors thrown by a user-supplied parser', async () => {
    const path = join(cwd, 'app.yaml');
    writeFileSync(path, 'port: 4040\n');

    const boom = (): unknown => {
      throw new Error('parser boom');
    };

    await expect(loadFile(path, { '.yaml': boom })).rejects.toThrow(
      'parser boom'
    );
  });
});
