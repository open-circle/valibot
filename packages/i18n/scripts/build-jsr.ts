import fs from 'node:fs';
import path from 'node:path';
import jsr from '../jsr.json';
import package_ from '../package.json';
import ar from '../src/ar';
import ca from '../src/ca';
import cs from '../src/cs';
import de from '../src/de';
import es from '../src/es';
import fa from '../src/fa';
import fi from '../src/fi';
import fr from '../src/fr';
import hu from '../src/hu';
import id from '../src/id';
import it from '../src/it';
import ja from '../src/ja';
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
  fi,
  fr,
  id,
  it,
  hu,
  ja,
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

// Create root imports variable
const rootImports: string[] = [];

// Create exclude array
const exclude: string[] = [
  'scripts',
  'src',
  'CHANGELOG.md',
  'package.json',
  'tsconfig.json',
  '!index.ts',
];

// Create exports object with index file
const exports: Record<string, string> = {
  '.': './index.ts',
};

// Clean root directory
for (const file of package_.files) {
  fs.rmSync(file, { recursive: true, force: true });
}

// Create language specific submodules
for (const language of languages) {
  // Create language directory
  fs.mkdirSync(language.code);

  // Add language to exclude
  exclude.push(`!${language.code}`);

  // Add index file to exports
  exports[`./${language.code}`] = `./${language.code}/index.ts`;

  // Add index imports to root index files
  rootImports.push(`import "./${language.code}/index.ts";`);

  // Create language imports variable
  const languageImports: string[] = [];

  // Add schema file to exports
  exports[`./${language.code}/schema`] = `./${language.code}/schema.ts`;

  // Add schema import to language index file
  languageImports.push(`import "./schema.ts";`);

  // Write schema.ts file
  fs.writeFileSync(
    path.join(language.code, 'schema.ts'),
    `
import { setSchemaMessage } from "jsr:@valibot/valibot@1.0.0-beta.3";

setSchemaMessage(
  ${language.schema.toString()},
  "${language.code}"
);
    `.trim()
  );

  // Create submodules for specific messages
  for (const [reference, message] of Object.entries(language.specific)) {
    // Add file to exports
    exports[`./${language.code}/${reference}`] =
      `./${language.code}/${reference}.ts`;

    // Add import to language index file
    languageImports.push(`import "./${reference}.ts";`);

    // Write ${reference}.ts file
    fs.writeFileSync(
      path.join(language.code, `${reference}.ts`),
      `
import { setSpecificMessage, ${reference} } from "jsr:@valibot/valibot@1.0.0-beta.3";

setSpecificMessage(
  ${reference},
  ${message.toString()},
  "${language.code}"
);
    `.trim()
    );
  }

  // Write language index.ts file
  fs.writeFileSync(
    path.join(language.code, 'index.ts'),
    languageImports.join('\n')
  );
}

// Write root index.ts file
fs.writeFileSync('index.ts', rootImports.join('\n'));

// Write root jsr.json file
fs.writeFileSync(
  'jsr.json',
  JSON.stringify({ ...jsr, exclude, exports }, null, 2)
);

// End timer
console.timeEnd('build');
