import fs from 'node:fs';
import path from 'node:path';
import package_ from '../package.json';
import ar from '../src/ar';
import ca from '../src/ca';
import cs from '../src/cs';
import de from '../src/de';
import es from '../src/es';
import fa from '../src/fa';
import fr from '../src/fr';
import hu from '../src/hu';
import id from '../src/id';
import it from '../src/it';
import ja from '../src/ja';
import ko from '../src/ko';
import kr from '../src/kr';
import nb from '../src/nb';
import nl from '../src/nl';
import pl from '../src/pl';
import pt from '../src/pt';
import ro from '../src/ro';
import ru from '../src/ru';
import sl from '../src/sl';
import sv from '../src/sv';
import tr from '../src/tr';
import uk from '../src/uk';
import vi from '../src/vi';
import zhCN from '../src/zh-CN';
import zhTW from '../src/zh-TW';

// Start timer
console.time('build');

// Create languages array
// Note: The language file `en` does not need to be added as the default
// messages of Valibot are already in English
const languages = [
  ar,
  ca,
  cs,
  de,
  es,
  fa,
  fr,
  hu,
  id,
  it,
  ja,
  ko,
  kr,
  nb,
  nl,
  pl,
  pt,
  ro,
  ru,
  sl,
  sv,
  tr,
  uk,
  vi,
  zhCN,
  zhTW,
];

// Create root import variables
const rootModuleImports: string[] = [];
const rootCommonImports: string[] = ['"use strict";'];

// Create files array
const files: string[] = [
  'index.ts',
  'index.js',
  'index.cjs',
  'index.d.ts',
  'index.d.cts',
];

/**
 * Exports type.
 */
type Exports = Record<
  string,
  {
    import: {
      types: string;
      default: string;
    };
    require: {
      types: string;
      default: string;
    };
  }
>;

// Create exports object with index files
const exports: Exports = {
  '.': {
    import: {
      types: './index.d.ts',
      default: './index.js',
    },
    require: {
      types: './index.d.cts',
      default: './index.cjs',
    },
  },
};

// Clean root directory
for (const file of package_.files) {
  fs.rmSync(file, { recursive: true, force: true });
}

// Create language specific submodules
for (const language of languages) {
  // Create language directory
  fs.mkdirSync(language.code);

  // Add language to files
  files.push(language.code);

  // Add index files to exports
  exports[`./${language.code}`] = {
    import: {
      types: `./${language.code}/index.d.ts`,
      default: `./${language.code}/index.js`,
    },
    require: {
      types: `./${language.code}/index.d.cts`,
      default: `./${language.code}/index.cjs`,
    },
  };

  // Add index imports to root index files
  rootModuleImports.push(`import "@valibot/i18n/${language.code}";`);
  rootCommonImports.push(
    `var import_${language.code} = require("@valibot/i18n/${language.code}");`
  );

  // Create language import variables
  const languageModuleImports: string[] = [];
  const languageCommonImports: string[] = ['"use strict";'];

  // Add schema files to exports
  exports[`./${language.code}/schema`] = {
    import: {
      types: `./${language.code}/schema.d.ts`,
      default: `./${language.code}/schema.js`,
    },
    require: {
      types: `./${language.code}/schema.d.cts`,
      default: `./${language.code}/schema.cjs`,
    },
  };

  // Add schema import to language index file
  languageModuleImports.push(`import "@valibot/i18n/${language.code}/schema";`);
  languageCommonImports.push(
    `var import_schema = require("@valibot/i18n/${language.code}/schema");`
  );

  // Write schema.js file
  fs.writeFileSync(
    path.join(language.code, 'schema.js'),
    `
import { setSchemaMessage } from "valibot";
setSchemaMessage(
  ${language.schema.toString()},
  "${language.code}"
);
    `.trim()
  );

  // Write schema.cjs file
  fs.writeFileSync(
    path.join(language.code, 'schema.cjs'),
    `
"use strict";
var import_valibot = require("valibot");
(0, import_valibot.setSchemaMessage)(
  ${language.schema.toString()},
  "${language.code}"
);
    `.trim()
  );

  // Write schema.d.ts file
  fs.writeFileSync(path.join(language.code, 'schema.d.ts'), 'export { }');

  // Write schema.d.cts file
  fs.writeFileSync(path.join(language.code, 'schema.d.cts'), 'export { }');

  // Create submodules for specific messages
  for (const [reference, message] of Object.entries(language.specific)) {
    // Add files to exports
    exports[`./${language.code}/${reference}`] = {
      import: {
        types: `./${language.code}/${reference}.d.ts`,
        default: `./${language.code}/${reference}.js`,
      },
      require: {
        types: `./${language.code}/${reference}.d.cts`,
        default: `./${language.code}/${reference}.cjs`,
      },
    };

    // Add import to language index file
    languageModuleImports.push(
      `import "@valibot/i18n/${language.code}/${reference}";`
    );
    languageCommonImports.push(
      `var import_${reference} = require("@valibot/i18n/${language.code}/${reference}");`
    );

    // Write ${reference}.js file
    fs.writeFileSync(
      path.join(language.code, `${reference}.js`),
      `
import { setSpecificMessage, ${reference} } from "valibot";
setSpecificMessage(
  ${reference},
  ${message.toString()},
  "${language.code}"
);
    `.trim()
    );

    // Write ${reference}.cjs file
    fs.writeFileSync(
      path.join(language.code, `${reference}.cjs`),
      `
"use strict";
var import_valibot = require("valibot");
(0, import_valibot.setSpecificMessage)(
  import_valibot.${reference},
  ${message.toString()},
  "${language.code}"
);
    `.trim()
    );

    // Write ${reference}.d.ts file
    fs.writeFileSync(
      path.join(language.code, `${reference}.d.ts`),
      'export { }'
    );

    // Write ${reference}.d.cts file
    fs.writeFileSync(
      path.join(language.code, `${reference}.d.cts`),
      'export { }'
    );
  }

  // Write language index.js file
  fs.writeFileSync(
    path.join(language.code, 'index.js'),
    languageModuleImports.join('\n')
  );

  // Write language index.cjs file
  fs.writeFileSync(
    path.join(language.code, 'index.cjs'),
    languageCommonImports.join('\n')
  );

  // Write language index.d.ts file
  fs.writeFileSync(path.join(language.code, 'index.d.ts'), 'export { }');

  // Write language index.d.cts file
  fs.writeFileSync(path.join(language.code, 'index.d.cts'), 'export { }');
}

// Write root index.js file
fs.writeFileSync('index.js', rootModuleImports.join('\n'));

// Write root index.cjs file
fs.writeFileSync('index.cjs', rootCommonImports.join('\n'));

// Write root index.d.ts file
fs.writeFileSync('index.d.ts', 'export { }');

// Write root index.d.cts file
fs.writeFileSync('index.d.cts', 'export { }');

// Write root package.json file
fs.writeFileSync(
  'package.json',
  JSON.stringify({ ...package_, files, exports }, null, 2)
);

// Write root .gitignore file
fs.writeFileSync('.gitignore', files.join('\n'));

// End timer
console.timeEnd('build');
