import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  RecursiveMarker: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'RecursiveMarkerSymbol',
    },
  },
};
