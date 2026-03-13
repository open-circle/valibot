import j from 'jscodeshift';
import { addToPipe } from '../../helpers';

export function transformRefine(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  // Transform Zod's refine arguments to Valibot's check arguments
  const transformedArgs = args.map((arg) => {
    // If the argument is an object with { message: "..." }, extract the message
    if (
      arg.type === 'ObjectExpression' &&
      arg.properties.length === 1 &&
      arg.properties[0].type === 'ObjectProperty' &&
      arg.properties[0].key.type === 'Identifier' &&
      arg.properties[0].key.name === 'message'
    ) {
      return arg.properties[0].value;
    }
    return arg;
  }) as typeof args;

  return addToPipe(
    valibotIdentifier,
    schemaExp,
    j.callExpression(
      j.memberExpression(
        j.identifier(valibotIdentifier),
        j.identifier('check')
      ),
      transformedArgs
    )
  );
}
