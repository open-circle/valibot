import j from 'jscodeshift';
import { splitLastArg } from '../../helpers';
import { ZodSchemaType } from '../../types';
import { getValidatorMsg } from '../helpers';

export function transformMax(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  schemaType: ZodSchemaType
) {
  const { firstArgs: argsExceptOptions, lastArg } = splitLastArg(2, args);
  const msgArg = getValidatorMsg(lastArg);

  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier(
        `max${schemaType === 'value' ? 'Value' : schemaType === 'size' ? 'Size' : 'Length'}`
      )
    ),
    [...argsExceptOptions, ...(msgArg !== null ? [msgArg] : [])]
  );
}
