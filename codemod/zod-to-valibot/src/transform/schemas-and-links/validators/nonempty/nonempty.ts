import j from 'jscodeshift';
import { splitLastArg } from '../../helpers';
import { getValidatorMsg } from '../helpers';

export function transformNonEmpty(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  isSizeSchemaType: boolean
) {
  const { lastArg } = splitLastArg(1, args);
  const msgArg = getValidatorMsg(lastArg);

  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier(isSizeSchemaType ? 'minSize' : 'nonEmpty')
    ),
    [
      ...(isSizeSchemaType ? [j.numericLiteral(1)] : []),
      ...(msgArg !== null ? [msgArg] : []),
    ]
  );
}
