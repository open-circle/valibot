import j from 'jscodeshift';
import { splitLastArg } from '../../helpers';
import { getValidatorMsg } from '../helpers';

export function getVersion(
  arg: j.CallExpression['arguments'][number] | null
): 'ipv4' | 'ipv6' | null {
  if (arg === null || arg.type !== 'ObjectExpression') {
    return null;
  }
  const vals = arg.properties
    .map((p) =>
      p.type === 'ObjectProperty' &&
      p.key.type === 'Identifier' &&
      p.key.name === 'version'
        ? p.value
        : null
    )
    .filter((v) => v !== null);
  const val = vals.at(0);
  // todo: handle cases where the version is not a string literal
  return val?.type === 'StringLiteral'
    ? val.value === 'v4'
      ? 'ipv4'
      : 'ipv6'
    : null;
}

export function transformIp(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  const { lastArg } = splitLastArg(1, args);
  const msgArg = getValidatorMsg(lastArg);

  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier(getVersion(lastArg) ?? 'ip')
    ),
    msgArg !== null ? [msgArg] : []
  );
}
