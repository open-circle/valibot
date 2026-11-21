import MagicString from 'magic-string';
import { analyzeCode } from '../analyze/index.ts';
import { generateCompiledSchema } from '../codegen/index.ts';

/**
 * Transforms source code by replacing `compiled(...)` calls with optimized
 * schema object literals.
 *
 * @param code The source code to transform.
 * @param id The module ID / filename.
 *
 * @returns The transformed code and source map, or `undefined` if no
 *   transformations were made.
 */
export function transformCode(
  code: string,
  id: string
): { code: string; map: ReturnType<MagicString['generateMap']> } | undefined {
  // Quick check before parsing
  if (!code.includes('@valibot/compiler')) return undefined;

  // Analyze the source for compilable calls
  const calls = analyzeCode(code, id);
  if (calls.length === 0) return undefined;

  // Apply replacements using magic-string
  const ms = new MagicString(code);

  for (const call of calls) {
    const originalSchemaSource = code.slice(
      call.schemaArgStart,
      call.schemaArgEnd
    );
    const replacement = generateCompiledSchema(
      call.node,
      call.valibotBinding,
      call.compiledBinding,
      originalSchemaSource
    );
    ms.overwrite(call.start, call.end, replacement);
  }

  return {
    code: ms.toString(),
    map: ms.generateMap({ hires: 'boundary' }),
  };
}
