import j from 'jscodeshift';
import {
  getDescription,
  getSchemaComps,
  getSchemaWithOptionalDescription,
} from '../helpers';

export function transformBigint(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  coerceSchema: boolean
) {
  const { baseSchema, coerce, description } = getSchemaComps(
    valibotIdentifier,
    'bigint',
    args,
    1,
    coerceSchema
  );
  if (coerce) {
    return j.callExpression(
      j.memberExpression(j.identifier(valibotIdentifier), j.identifier('pipe')),
      [
        j.callExpression(
          j.memberExpression(
            j.identifier(valibotIdentifier),
            j.identifier('any')
          ),
          []
        ),
        j.callExpression(
          j.memberExpression(
            j.identifier(valibotIdentifier),
            j.identifier('transform')
          ),
          [
            j.arrowFunctionExpression(
              [j.identifier('input')],
              j.blockStatement([
                j.tryStatement(
                  j.blockStatement([
                    j.returnStatement(
                      j.callExpression(j.identifier('BigInt'), [
                        j.identifier('input'),
                      ])
                    ),
                  ]),
                  j.catchClause(
                    null,
                    null,
                    j.blockStatement([j.returnStatement(j.identifier('input'))])
                  )
                ),
              ]),
              false
            ),
          ]
        ),
        baseSchema,
        ...(description
          ? [getDescription(valibotIdentifier, description)]
          : []),
      ]
    );
  }
  return getSchemaWithOptionalDescription(
    valibotIdentifier,
    baseSchema,
    description
  );
}
