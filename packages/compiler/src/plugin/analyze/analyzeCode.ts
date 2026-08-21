import { parseSync } from 'oxc-parser';
import type {
  CallExpression,
  Expression,
  ImportDeclaration,
  Program,
} from 'oxc-parser';
import { walk } from 'oxc-walker';
import type { AnalyzedCall, SchemaNode } from '../types/index.ts';
import { analyzePipe } from './methods/analyzePipe.ts';
import { analyzeObjectSchema } from './schemas/analyzeObjectSchema.ts';
import { analyzeStringSchema } from './schemas/analyzeStringSchema.ts';
import { getValibotFunctionName } from './utils/getValibotFunctionName.ts';

/**
 * Analyzes source code for `compiled(...)` calls and extracts schema IR.
 *
 * @param code The source code to analyze.
 * @param filename The filename (used by oxc-parser for language detection).
 *
 * @returns Array of analyzed calls that can be compiled.
 */
export function analyzeCode(
  code: string,
  filename: string
): readonly AnalyzedCall[] {
  const result = parseSync(filename, code);
  const program = result.program;

  // Find import bindings
  const imports = findImports(program);
  if (!imports) return [];

  const { valibotBinding, compiledBindings } = imports;

  // Find and analyze compiled() calls
  const calls: AnalyzedCall[] = [];

  walk(program, {
    enter(node) {
      if (node.type !== 'CallExpression') return;
      const call = node as CallExpression;

      // Check if this is a compiled(...) call
      const compiledBinding = getCompiledBinding(call, compiledBindings);
      if (!compiledBinding) return;

      // Must have exactly one argument
      if (call.arguments.length !== 1) return;
      const arg = call.arguments[0];
      if (!arg || arg.type === 'SpreadElement') return;

      // Analyze the schema argument
      const schemaNode = analyzeExpression(arg as Expression, valibotBinding);
      if (!schemaNode) return;

      calls.push({
        start: call.start,
        end: call.end,
        node: schemaNode,
        valibotBinding,
        compiledBinding,
        schemaArgStart: arg.start,
        schemaArgEnd: arg.end,
      });
    },
  });

  return calls;
}

interface ImportBindings {
  valibotBinding: string;
  compiledBindings: Set<string>;
}

/**
 * Finds the valibot namespace import and compiled/compiledAsync imports.
 */
function findImports(program: Program): ImportBindings | null {
  let valibotBinding: string | undefined;
  const compiledBindings = new Set<string>();

  for (const node of program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    const decl = node as ImportDeclaration;

    if (decl.source.value === 'valibot') {
      for (const spec of decl.specifiers) {
        if (spec.type === 'ImportNamespaceSpecifier') {
          valibotBinding = spec.local.name;
        }
      }
    }

    if (decl.source.value === '@valibot/compiler') {
      for (const spec of decl.specifiers) {
        if (spec.type === 'ImportSpecifier') {
          const imported =
            spec.imported.type === 'Identifier'
              ? spec.imported.name
              : spec.imported.value;
          if (imported === 'compiled' || imported === 'compiledAsync') {
            compiledBindings.add(spec.local.name);
          }
        }
      }
    }
  }

  if (!valibotBinding || compiledBindings.size === 0) return null;
  return { valibotBinding, compiledBindings };
}

/**
 * Checks if a call expression is a `compiled(...)` call and returns the
 * binding name used.
 */
function getCompiledBinding(
  call: CallExpression,
  compiledBindings: Set<string>
): string | undefined {
  if (call.callee.type !== 'Identifier') return undefined;
  const name = (call.callee as { name: string }).name;
  return compiledBindings.has(name) ? name : undefined;
}

/**
 * Recursively analyzes an expression to build a schema IR node.
 * Returns `null` if the expression is not statically analyzable.
 */
export function analyzeExpression(
  expr: Expression,
  vBinding: string
): SchemaNode | null {
  if (expr.type !== 'CallExpression') return null;
  const call = expr as CallExpression;

  const fnName = getValibotFunctionName(call, vBinding);
  if (!fnName) return null;

  switch (fnName) {
    case 'object':
      return analyzeObjectSchema(call, vBinding);
    case 'string':
      return analyzeStringSchema(call);
    case 'pipe':
      return analyzePipe(call, vBinding);
    default:
      return null;
  }
}
