import j from 'jscodeshift';
import { splitLastArg } from '../../helpers';
import { getValidatorMsg } from '../helpers';

export function transformPositive(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  useBigInt: boolean
) {
  const { firstArgs: argsExceptOptions, lastArg } = splitLastArg(1, args);
  const msgArg = getValidatorMsg(lastArg);

  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('gtValue')
    ),
    [
      useBigInt ? j.bigIntLiteral('0') : j.numericLiteral(0),
      ...argsExceptOptions,
      ...(msgArg !== null ? [msgArg] : []),
    ]
  );
}
