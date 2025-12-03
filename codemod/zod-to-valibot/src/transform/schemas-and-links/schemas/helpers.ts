import j from 'jscodeshift';
import { splitLastArg } from '../helpers';
import type { SchemaOptionsToASTVal } from './types';

export function getTransformedMsgs(schemaOptions: SchemaOptionsToASTVal) {
  return schemaOptions.message
    ? [schemaOptions.message]
    : schemaOptions.required_error
      ? [
          j.arrowFunctionExpression(
            [j.identifier('issue')],
            j.conditionalExpression(
              j.binaryExpression(
                '===',
                j.memberExpression(
                  j.identifier('issue'),
                  j.identifier('input')
                ),
                j.identifier('undefined')
              ),
              schemaOptions.required_error,
              schemaOptions.invalid_type_error ??
                j.memberExpression(
                  j.identifier('issue'),
                  j.identifier('message')
                )
            ),
            true
          ),
        ]
      : schemaOptions.invalid_type_error
        ? [schemaOptions.invalid_type_error]
        : [];
}

export function getOption(
  optionsArgs: j.CallExpression['arguments'][number],
  optionName: string
) {
  if (optionsArgs.type !== 'ObjectExpression') {
    return null;
  }
  const optionVals = optionsArgs.properties
    .map((p) =>
      p.type === 'ObjectProperty' &&
      p.key.type === 'Identifier' &&
      p.key.name === optionName
        ? p.value
        : null
    )
    .filter((v) => v !== null);
  const optionVal = optionVals.at(0);
  return optionVal === undefined ||
    optionVal.type === 'RestElement' ||
    optionVal.type === 'SpreadElementPattern' ||
    optionVal.type === 'PropertyPattern' ||
    optionVal.type === 'ObjectPattern' ||
    optionVal.type === 'ArrayPattern' ||
    optionVal.type === 'AssignmentPattern' ||
    optionVal.type === 'SpreadPropertyPattern' ||
    optionVal.type === 'TSParameterProperty'
    ? null
    : optionVal;
}

export function getOptions(
  optionsArgs: j.CallExpression['arguments'][number]
): Partial<
  Record<
    'description' | 'invalid_type_error' | 'required_error' | 'message',
    ReturnType<typeof getOption>
  > & { coerce: boolean }
> {
  const coerceOption = getOption(optionsArgs, 'coerce');
  return {
    description: getOption(optionsArgs, 'description'),
    invalid_type_error: getOption(optionsArgs, 'invalid_type_error'),
    required_error: getOption(optionsArgs, 'required_error'),
    message: getOption(optionsArgs, 'message'),
    coerce: coerceOption?.type === 'BooleanLiteral' && coerceOption.value,
  };
}

export function getSchemaComps(
  valibotIdentifier: string,
  schemaName: string,
  args: j.CallExpression['arguments'],
  maxArgs: number,
  coerce = false,
  addMsgArg = true
) {
  const { firstArgs: argsExceptOptions, lastArg } = splitLastArg(maxArgs, args);
  const options = lastArg !== null ? getOptions(lastArg) : {};
  return {
    baseSchema: j.callExpression(
      j.memberExpression(
        j.identifier(valibotIdentifier),
        j.identifier(schemaName)
      ),
      [...argsExceptOptions, ...(addMsgArg ? getTransformedMsgs(options) : [])]
    ),
    coerce: coerce || options.coerce,
    description: options.description,
  };
}

export function getDescription(
  valibotIdentifier: string,
  description: SchemaOptionsToASTVal['description'] & {}
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('description')
    ),
    [description]
  );
}

export function getSchemaWithOptionalDescription(
  valibotIdentifier: string,
  schema: j.CallExpression,
  description: SchemaOptionsToASTVal['description']
) {
  return description
    ? j.callExpression(
        j.memberExpression(
          j.identifier(valibotIdentifier),
          j.identifier('pipe')
        ),
        [schema, getDescription(valibotIdentifier, description)]
      )
    : schema;
}
