import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  T: {
    type: 'unknown',
    modifier: 'extends',
  },
  TArgs: {
    type: 'unknown',
    modifier: 'extends',
  },
  Generics: {
    type: { type: 'object', entries: [] },
  },
};
