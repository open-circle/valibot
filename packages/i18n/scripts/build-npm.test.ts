import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createPackageExports } from './exports.ts';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptsDir, '..');
const require = createRequire(import.meta.url);

describe('createPackageExports', () => {
  test('emits root, per-language index, and per-language subpath patterns', () => {
    const exports = createPackageExports(['de', 'ru', 'zh-CN']);

    assert.deepEqual(Object.keys(exports), [
      '.',
      './de',
      './de/index',
      './de/*',
      './ru',
      './ru/index',
      './ru/*',
      './zh-CN',
      './zh-CN/index',
      './zh-CN/*',
    ]);

    assert.deepEqual(exports['.'], {
      import: { types: './index.d.mts', default: './index.mjs' },
      require: { types: './index.d.cts', default: './index.cjs' },
    });
    assert.deepEqual(exports['./ru'], {
      import: { types: './ru/index.d.mts', default: './ru/index.mjs' },
      require: { types: './ru/index.d.cts', default: './ru/index.cjs' },
    });
    assert.equal(exports['./ru/index'], null);
    assert.deepEqual(exports['./ru/*'], {
      import: { types: './ru/*.d.mts', default: './ru/*.mjs' },
      require: { types: './ru/*.d.cts', default: './ru/*.cjs' },
    });
    assert.deepEqual(exports['./zh-CN/*'], {
      import: { types: './zh-CN/*.d.mts', default: './zh-CN/*.mjs' },
      require: { types: './zh-CN/*.d.cts', default: './zh-CN/*.cjs' },
    });
  });

  test('matches checked-in package.json exports without per-validator keys', () => {
    const srcFiles = fs
      .readdirSync(path.join(packageDir, 'src'))
      .filter((file) => file.endsWith('.ts'))
      .map((file) => file.slice(0, -3))
      .filter((code) => code !== 'en' && code !== 'types')
      .sort();

    const pkgRaw = fs.readFileSync(
      path.join(packageDir, 'package.json'),
      'utf8'
    );
    const pkg: unknown = JSON.parse(pkgRaw);
    assert.equal(typeof pkg, 'object');
    assert.notEqual(pkg, null);
    const pkgExports: unknown =
      pkg && typeof pkg === 'object' ? Reflect.get(pkg, 'exports') : undefined;

    assert.deepEqual(pkgExports, createPackageExports(srcFiles));
    assert.ok(
      Buffer.byteLength(pkgRaw, 'utf8') < 32 * 1024,
      'package.json should remain compact using subpath patterns'
    );
  });

  test('resolves ESM, CJS, and TypeScript declarations across subpath patterns', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'valibot-i18n-'));
    try {
      const i18nDir = path.join(tempDir, 'node_modules', '@valibot', 'i18n');
      const langs: readonly string[] = ['de', 'ru', 'zh-CN'];
      const validators: readonly string[] = ['schema', 'email', 'minLength'];
      const exports = createPackageExports(langs);

      fs.mkdirSync(i18nDir, { recursive: true });
      fs.writeFileSync(
        path.join(i18nDir, 'package.json'),
        `${JSON.stringify(
          {
            name: '@valibot/i18n',
            version: '1.3.0',
            type: 'module',
            main: './index.mjs',
            types: './index.d.mts',
            exports,
          },
          null,
          2
        )}\n`
      );

      const rootEsm: string[] = [];
      const rootCjs: string[] = ['"use strict";'];
      for (const lang of langs) {
        const langDir = path.join(i18nDir, lang);
        fs.mkdirSync(langDir, { recursive: true });
        const langEsm: string[] = [];
        const langCjs: string[] = ['"use strict";'];

        for (const validator of validators) {
          langEsm.push(`import "@valibot/i18n/${lang}/${validator}";`);
          langCjs.push(`require("@valibot/i18n/${lang}/${validator}");`);
          fs.writeFileSync(
            path.join(langDir, `${validator}.mjs`),
            `globalThis.__loaded.push("${lang}/${validator}:esm");\n`
          );
          fs.writeFileSync(
            path.join(langDir, `${validator}.cjs`),
            `globalThis.__loaded.push("${lang}/${validator}:cjs");\n`
          );
          fs.writeFileSync(
            path.join(langDir, `${validator}.d.mts`),
            'export { }\n'
          );
          fs.writeFileSync(
            path.join(langDir, `${validator}.d.cts`),
            'export { }\n'
          );
        }

        fs.writeFileSync(
          path.join(langDir, 'index.mjs'),
          `${langEsm.join('\n')}\n`
        );
        fs.writeFileSync(
          path.join(langDir, 'index.cjs'),
          `${langCjs.join('\n')}\n`
        );
        fs.writeFileSync(path.join(langDir, 'index.d.mts'), 'export { }\n');
        fs.writeFileSync(path.join(langDir, 'index.d.cts'), 'export { }\n');

        rootEsm.push(`import "@valibot/i18n/${lang}";`);
        rootCjs.push(`require("@valibot/i18n/${lang}");`);
      }

      fs.writeFileSync(
        path.join(i18nDir, 'index.mjs'),
        `${rootEsm.join('\n')}\n`
      );
      fs.writeFileSync(
        path.join(i18nDir, 'index.cjs'),
        `${rootCjs.join('\n')}\n`
      );
      fs.writeFileSync(path.join(i18nDir, 'index.d.mts'), 'export { }\n');
      fs.writeFileSync(path.join(i18nDir, 'index.d.cts'), 'export { }\n');

      // Verify ESM resolution and invalid subpath rejections
      const esmOut = execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `
          globalThis.__loaded = [];
          await import('@valibot/i18n');
          await import('@valibot/i18n/ru');
          await import('@valibot/i18n/ru/schema');
          await import('@valibot/i18n/ru/email');
          await import('@valibot/i18n/zh-CN/minLength');
          const errors = [];
          for (const bad of ['@valibot/i18n/ru/index', '@valibot/i18n/ru/nonExistent', '@valibot/i18n/ru/email.mjs', '@valibot/i18n/xx/email']) {
            try {
              await import(bad);
              errors.push('UNEXPECTED_OK:' + bad);
            } catch (err) {
              errors.push(err.code);
            }
          }
          console.log(JSON.stringify({ loaded: globalThis.__loaded, errors }));
          `,
        ],
        { cwd: tempDir, encoding: 'utf8' }
      );
      const esmResult: unknown = JSON.parse(esmOut);
      assert.ok(esmResult && typeof esmResult === 'object');
      const esmLoaded = Reflect.get(esmResult, 'loaded');
      const esmErrors = Reflect.get(esmResult, 'errors');
      assert.deepEqual(esmLoaded, [
        'de/schema:esm',
        'de/email:esm',
        'de/minLength:esm',
        'ru/schema:esm',
        'ru/email:esm',
        'ru/minLength:esm',
        'zh-CN/schema:esm',
        'zh-CN/email:esm',
        'zh-CN/minLength:esm',
      ]);
      assert.deepEqual(esmErrors, [
        'ERR_PACKAGE_PATH_NOT_EXPORTED',
        'ERR_MODULE_NOT_FOUND',
        'ERR_MODULE_NOT_FOUND',
        'ERR_PACKAGE_PATH_NOT_EXPORTED',
      ]);

      // Verify CJS resolution and invalid subpath rejections
      const cjsOut = execFileSync(
        process.execPath,
        [
          '-e',
          `
          globalThis.__loaded = [];
          require('@valibot/i18n');
          require('@valibot/i18n/ru');
          require('@valibot/i18n/ru/schema');
          require('@valibot/i18n/ru/email');
          require('@valibot/i18n/zh-CN/minLength');
          const errors = [];
          for (const bad of ['@valibot/i18n/ru/index', '@valibot/i18n/ru/nonExistent', '@valibot/i18n/ru/email.cjs', '@valibot/i18n/xx/email']) {
            try {
              require(bad);
              errors.push('UNEXPECTED_OK:' + bad);
            } catch (err) {
              errors.push(err.code);
            }
          }
          console.log(JSON.stringify({ loaded: globalThis.__loaded, errors }));
          `,
        ],
        { cwd: tempDir, encoding: 'utf8' }
      );
      const cjsResult: unknown = JSON.parse(cjsOut);
      assert.ok(cjsResult && typeof cjsResult === 'object');
      const cjsLoaded = Reflect.get(cjsResult, 'loaded');
      const cjsErrors = Reflect.get(cjsResult, 'errors');
      assert.deepEqual(cjsLoaded, [
        'de/schema:cjs',
        'de/email:cjs',
        'de/minLength:cjs',
        'ru/schema:cjs',
        'ru/email:cjs',
        'ru/minLength:cjs',
        'zh-CN/schema:cjs',
        'zh-CN/email:cjs',
        'zh-CN/minLength:cjs',
      ]);
      assert.deepEqual(cjsErrors, [
        'ERR_PACKAGE_PATH_NOT_EXPORTED',
        'MODULE_NOT_FOUND',
        'MODULE_NOT_FOUND',
        'ERR_PACKAGE_PATH_NOT_EXPORTED',
      ]);

      // Verify TypeScript resolution under both nodenext and bundler modes
      const tscPath = require.resolve('typescript/bin/tsc');
      fs.writeFileSync(
        path.join(tempDir, 'consumer.ts'),
        [
          "import '@valibot/i18n';",
          "import '@valibot/i18n/ru';",
          "import '@valibot/i18n/ru/schema';",
          "import '@valibot/i18n/ru/email';",
          "import '@valibot/i18n/zh-CN/minLength';",
        ].join('\n') + '\n'
      );
      fs.writeFileSync(
        path.join(tempDir, 'invalid-index.ts'),
        "import '@valibot/i18n/ru/index';\n"
      );
      fs.writeFileSync(
        path.join(tempDir, 'invalid-missing.ts'),
        "import '@valibot/i18n/ru/nonExistent';\n"
      );

      for (const config of [
        { module: 'nodenext', moduleResolution: 'nodenext' },
        { module: 'esnext', moduleResolution: 'bundler' },
      ]) {
        const tsconfigPath = path.join(
          tempDir,
          `tsconfig.${config.moduleResolution}.json`
        );
        fs.writeFileSync(
          tsconfigPath,
          JSON.stringify(
            {
              compilerOptions: {
                strict: true,
                noUncheckedSideEffectImports: true,
                noEmit: true,
                module: config.module,
                moduleResolution: config.moduleResolution,
              },
              include: ['consumer.ts'],
            },
            null,
            2
          )
        );
        execFileSync(process.execPath, [tscPath, '-p', tsconfigPath], {
          cwd: tempDir,
          encoding: 'utf8',
        });

        for (const invalidFile of ['invalid-index.ts', 'invalid-missing.ts']) {
          const invalidTsconfigPath = path.join(
            tempDir,
            `tsconfig.${config.moduleResolution}.${invalidFile}.json`
          );
          fs.writeFileSync(
            invalidTsconfigPath,
            JSON.stringify(
              {
                compilerOptions: {
                  strict: true,
                  noUncheckedSideEffectImports: true,
                  noEmit: true,
                  module: config.module,
                  moduleResolution: config.moduleResolution,
                },
                include: [invalidFile],
              },
              null,
              2
            )
          );
          assert.throws(() =>
            execFileSync(
              process.execPath,
              [tscPath, '-p', invalidTsconfigPath],
              { cwd: tempDir, encoding: 'utf8', stdio: 'pipe' }
            )
          );
        }
      }
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
