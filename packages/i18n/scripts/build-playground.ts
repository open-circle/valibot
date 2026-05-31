import fs from 'node:fs';
import path from 'node:path';
import ar from '../src/ar';
import az from '../src/az';
import ca from '../src/ca';
import cs from '../src/cs';
import de from '../src/de';
import el from '../src/el';
import es from '../src/es';
import fa from '../src/fa';
import fi from '../src/fi';
import fr from '../src/fr';
import hu from '../src/hu';
import id from '../src/id';
import it from '../src/it';
import ja from '../src/ja';
import ko from '../src/ko';
import kr from '../src/kr';
import mn from '../src/mn';
import nb from '../src/nb';
import nl from '../src/nl';
import pl from '../src/pl';
import pt from '../src/pt';
import ro from '../src/ro';
import ru from '../src/ru';
import sk from '../src/sk';
import sl from '../src/sl';
import sv from '../src/sv';
import tr from '../src/tr';
import uk from '../src/uk';
import uz from '../src/uz';
import vi from '../src/vi';
import zhCN from '../src/zh-CN';
import zhTW from '../src/zh-TW';

// Create languages array
// Note: The language file `en` does not need to be added as the default
// messages of Valibot are already in English
const languages = [
  ar,
  az,
  ca,
  cs,
  de,
  el,
  es,
  fa,
  fi,
  fr,
  hu,
  id,
  it,
  ja,
  ko,
  kr,
  mn,
  nb,
  nl,
  pl,
  pt,
  ro,
  ru,
  sk,
  sl,
  sv,
  tr,
  uk,
  uz,
  vi,
  zhCN,
  zhTW,
];

// This script builds self-contained ESM bundles for the Valibot playground
// (website/src/routes/playground). Unlike `build-npm`, which splits every
// language into many submodules that re-import each other via bare specifiers,
// here each language is emitted as a single file that registers all of its
// messages. `valibot` stays an external bare import so it resolves to the same
// instance as the user code through the playground's import map. The files are
// loaded by the playground via a static `?url` import, mirroring how the
// `valibot` and `@valibot/to-json-schema` bundles are wired up.

// Define and clean output directory
const outDir = path.join('dist', 'playground');
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
