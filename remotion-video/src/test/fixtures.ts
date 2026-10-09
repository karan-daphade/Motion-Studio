// src/test/fixtures.ts
import brandJson from '../../../brands/bharatqr/brand.json';
import { Brand } from '../schema/brand';

export const baseBrand = Brand.parse(brandJson);

export const alternateBrand: Brand = {
  ...baseBrand,
  colors: {
    ...baseBrand.colors,
    primary: '#0284C7', // Sky Blue
    secondary: '#0F172A', // Slate 900
    accent: '#10B981', // Emerald 500
  },
  layout: {
    ...baseBrand.layout,
    radii: {
      small: 2,
      medium: 4,
      large: 8,
    },
  },
};
