import j from 'jscodeshift';
import { splitLastArg } from '../../helpers';
import {
  getOptions,
  getSchemaWithOptionalDescription,
  getTransformedMsgs,
} from '../helpers';

export function transformIntersection(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  const { firstArgs: argsExceptOptions, lastArg } = splitLastArg(3, args);
  const options = lastArg !== null ? getOptions(lastArg) : {};
  return getSchemaWithOptionalDescription(
    valibotIdentifier,
    j.callExpression(
      j.memberExpression(
        j.identifier(valibotIdentifier),
        j.identifier('intersect')
      ),
      [j.arrayExpression(argsExceptOptions), ...getTransformedMsgs(options)]
    ),
    options.description
  );
}
