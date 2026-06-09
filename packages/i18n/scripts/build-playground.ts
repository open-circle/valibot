import fs from 'node:fs';
import path from 'node:path';
import type { Language } from '../src/types';

// Discover every language module in `src` (one `.ts` file per language) instead
// of listing them by hand. `en` is skipped because Valibot's default messages
// are already in English, and `types` is the shared type module, not a
// language. Adding a new language therefore requires no change to this script.
const languages = await Promise.all(
  fs
    .readdirSync('src')
    .filter(
      (file) => file.endsWith('.ts') && file !== 'en.ts' && file !== 'types.ts'
    )
    .sort()
    .map(async (file) => (await import(`../src/${file}`)).default as Language)
);

// This script builds self-contained ESM bundles for the Valibot playground
// (website/src/routes/playground). Unlike `build-npm`, which splits every
// language into many submodules that re-import each other via bare specifiers,
// here each language is emitted as a single file that registers all of its
// messages. `valibot` stays an external bare import so it resolves to the same
// instance as the user code through the playground's import map.
//
// The bundles are written into the website's `public` directory so they are
// served as static files. This is required: a bundle's bare
// `import ... from "valibot"` must reach the browser untouched. Files served
// through Vite's module pipeline (e.g. via a `?url` import) get their bare
// specifiers rewritten to a pre-bundled dependency, which loads a *second*
// Valibot instance and silently breaks i18n (registered messages never reach
// the user code's `safeParse`). Static `public` files are delivered verbatim.

// Define and clean the output directory (the website lives next to this
// package in the monorepo)
const outDir = path.join('..', '..', 'website', 'public', 'playground', 'i18n');
fs.rmSync(outDir, { recursive: true, force: true });

// Create a single bundle per language
for (const language of languages) {
  // Collect the specific message references (Valibot action names)
  const references = Object.keys(language.specific);

  // Build the file: one import of all used Valibot exports, followed by the
  // schema message and every specific message registration
  const lines = [
    `import { setSchemaMessage, setSpecificMessage, ${references.join(', ')} } from "valibot";`,
    `setSchemaMessage(${language.schema.toString()}, "${language.code}");`,
    ...Object.entries(language.specific).map(
      ([reference, message]) =>
        `setSpecificMessage(${reference}, ${message.toString()}, "${language.code}");`
    ),
  ];

  // Write the language bundle
  const langDir = path.join(outDir, language.code);
  fs.mkdirSync(langDir, { recursive: true });
  fs.writeFileSync(path.join(langDir, 'index.mjs'), `${lines.join('\n')}\n`);
}
