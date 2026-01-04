#!/usr/bin/env node

import { execSync } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const transformPath = path.join(__dirname, 'dist', 'index.mjs');
const require = createRequire(import.meta.url);
const jscodeshiftBin = require.resolve('jscodeshift/bin/jscodeshift.js');

const args = process.argv.slice(2);
const hasParserArg = args.some(
  (arg) => arg === '--parser' || arg.startsWith('--parser=')
);
const hasExtensionsArg = args.some((arg) => arg.startsWith('--extensions'));

const finalArgs = [...args];
if (!hasParserArg) {
  finalArgs.unshift('--parser=ts');
}
if (!hasExtensionsArg) {
  finalArgs.unshift('--extensions=ts,tsx,js,jsx');
}

if (args.length === 0) {
  console.log(`
Usage: @valibot/zod-to-valibot [options] <files>

Convert Zod schemas to Valibot schemas

Examples:
  @valibot/zod-to-valibot src/**/*.ts
  @valibot/zod-to-valibot --dry src/schemas.ts
  @valibot/zod-to-valibot --no-babel src/**/*.{ts,tsx}

Common jscodeshift options:
  --dry         Run without making changes
  --print       Print output
  --verbose=2   Increase verbosity
  --parser=ts   Specify parser (default: ts)

For all options, see: jscodeshift --help
`);
  process.exit(0);
}

try {
  const command = `"${process.execPath}" "${jscodeshiftBin}" -t "${transformPath}" ${finalArgs.join(' ')}`;
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}
