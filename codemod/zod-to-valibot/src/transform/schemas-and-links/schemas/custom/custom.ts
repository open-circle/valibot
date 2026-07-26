import j from 'jscodeshift';
import { splitLastArg } from '../../helpers';
import { getOption } from '../helpers';

export function transformCustom(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  // no type definition found
  typeParameters: any
) {
  const { firstArgs, lastArg } = splitLastArg(2, args);
  const messageArg: any[] = [];
  let messageKeyVal: any = null;
  if (lastArg !== null) {
    if (lastArg.type === 'StringLiteral') {
      messageArg.push(lastArg);
    } else if (
      lastArg.type === 'ObjectExpression' &&
      lastArg.properties.length === 1 &&
      (messageKeyVal = getOption(lastArg, 'message')) !== null
    ) {
      messageArg.push(messageKeyVal);
    } else {
      messageArg.push(lastArg);
    }
  }
  const transformedArgs = [...firstArgs, ...messageArg];
  if (transformedArgs.length === 0) {
    transformedArgs.push(j.arrowFunctionExpression([], j.booleanLiteral(true)));
  }
  const res = j.callExpression.from({
    callee: j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('custom')
    ),
    arguments: transformedArgs,
  });
  // parser and types are not in sync
  // @ts-expect-error
  res.typeParameters = typeParameters;
  return res;
}
