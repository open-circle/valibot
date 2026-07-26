import type { Transform } from 'jscodeshift';
import { transformImports } from './imports';
import { transformSchemasAndLinks } from './schemas-and-links';

const transform: Transform = (fileInfo, api) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // ------------ Imports ------------
  const transformImportsResult = transformImports(root);
  if (transformImportsResult.conclusion !== 'successful') {
    if (transformImportsResult.conclusion === 'unsuccessful') {
      const node = root.get().node;
      // Add comment indicating unsuccessful transformation
      node.comments ??= [];
      node.comments.unshift(
        j.commentBlock(
          ` @valibot-migrate: unable to transform imports from Zod to Valibot: ${transformImportsResult.cause} `,
          true,
          false
        )
      );
      return root.toSource();
    }
    return undefined;
  }
  const valibotIdentifier = transformImportsResult.valibotIdentifier;

  // ------------ Schemas and links ------------
  transformSchemasAndLinks(root, valibotIdentifier);

  return root.toSource();
};

export default transform;
