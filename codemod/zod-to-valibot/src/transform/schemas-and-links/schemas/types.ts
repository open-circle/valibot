import type { getOption } from './helpers';

type SchemaOptionASTVal = ReturnType<typeof getOption>;

export type SchemaOptionsToASTVal = Partial<
  Record<
    'invalid_type_error' | 'required_error' | 'message' | 'description',
    SchemaOptionASTVal
  >
>;
