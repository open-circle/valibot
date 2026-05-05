import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  EntriesInput: {
    type: {
      type: 'custom',
      name: 'Record',
      generics: [{ type: 'union', options: ['string', 'number'] }, 'unknown'],
    },
  },
};
