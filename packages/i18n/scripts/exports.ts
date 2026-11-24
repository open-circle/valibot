/**
 * Export condition entry for ESM or CJS module resolution.
 */
export interface ExportCondition {
  types: string;
  default: string;
}

/**
 * Dual ESM/CJS package export target.
 */
export interface ExportTarget {
  import: ExportCondition;
  require: ExportCondition;
}

/**
 * Package `exports` map keyed by export subpath or subpath pattern.
 */
export type PackageExports = Record<string, ExportTarget>;

/**
 * Creates the `exports` map for `@valibot/i18n` using one subpath pattern per
 * language instead of enumerating every validator file individually.
 *
 * @param languageCodes The supported ISO language codes.
 *
 * @returns The package `exports` map.
 */
export function createPackageExports(
  languageCodes: readonly string[]
): PackageExports {
  const exports: PackageExports = {
    '.': {
      import: {
        types: './index.d.mts',
        default: './index.mjs',
      },
      require: {
        types: './index.d.cts',
        default: './index.cjs',
      },
    },
  };

  for (const code of languageCodes) {
    exports[`./${code}`] = {
      import: {
        types: `./${code}/index.d.mts`,
        default: `./${code}/index.mjs`,
      },
      require: {
        types: `./${code}/index.d.cts`,
        default: `./${code}/index.cjs`,
      },
    };
    exports[`./${code}/*`] = {
      import: {
        types: `./${code}/*.d.mts`,
        default: `./${code}/*.mjs`,
      },
      require: {
        types: `./${code}/*.d.cts`,
        default: `./${code}/*.cjs`,
      },
    };
  }

  return exports;
}
