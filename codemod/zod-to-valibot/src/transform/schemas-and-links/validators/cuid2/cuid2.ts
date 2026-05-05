import j from 'jscodeshift';
import { splitLastArg } from '../../helpers';
import { getValidatorMsg } from '../helpers';

export function transformCUID2(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  const { firstArgs: argsExceptOptions, lastArg } = splitLastArg(1, args);
  const msgArg = getValidatorMsg(lastArg);

  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('cuid2')),
    [...argsExceptOptions, ...(msgArg !== null ? [msgArg] : [])]
  );
}
