// @vitest-environment node
/* eslint-disable security/detect-non-literal-fs-filename -- Paths come from the test module or a fresh temporary directory. */
import { execFile } from 'node:child_process';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect, test } from 'vitest';

const exec = promisify(execFile);

test('refreshes packaged skill files from the canonical source (#1746)', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'valibot-skill-'));
  expect(dirname(fixture)).toBe(resolve(tmpdir()));
  const script = join(fixture, 'library/scripts/prepare-skill.mjs');
  const source = join(
    fixture,
    'website/public/.well-known/agent-skills/valibot'
  );
  const target = join(fixture, 'library/skills/valibot');

  try {
    await mkdir(dirname(script), { recursive: true });
    await copyFile(
      join(dirname(fileURLToPath(import.meta.url)), 'prepare-skill.mjs'),
      script
    );
    await mkdir(join(source, 'references'), { recursive: true });
    await writeFile(join(source, 'SKILL.md'), 'Original skill');
    await writeFile(join(source, 'references/old.md'), 'Old reference');
    await exec(process.execPath, [script], { cwd: fixture, timeout: 10_000 });

    expect(await readFile(join(target, 'references/old.md'), 'utf8')).toBe(
      'Old reference'
    );

    await rm(join(source, 'references/old.md'));
    await writeFile(join(source, 'SKILL.md'), 'Updated skill');
    await writeFile(join(source, 'references/current.md'), 'Current reference');
    await exec(process.execPath, [script], { cwd: fixture, timeout: 10_000 });

    expect(await readFile(join(target, 'SKILL.md'), 'utf8')).toBe(
      'Updated skill'
    );
    expect(await readdir(join(target, 'references'))).toEqual(['current.md']);
    expect(await readFile(join(target, 'references/current.md'), 'utf8')).toBe(
      'Current reference'
    );
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
